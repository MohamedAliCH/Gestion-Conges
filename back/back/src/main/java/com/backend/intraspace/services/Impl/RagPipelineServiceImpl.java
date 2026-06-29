package com.backend.intraspace.services.Impl;

import com.backend.intraspace.entities.DocumentChunk;
import com.backend.intraspace.entities.DocumentRH;
import com.backend.intraspace.repositories.DocumentChunkRepository;
import com.backend.intraspace.repositories.DocumentRHRepository;
import com.backend.intraspace.services.LlmClient;
import com.backend.intraspace.services.RagPipelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.xml.sax.SAXException;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagPipelineServiceImpl implements RagPipelineService {

    private final DocumentRHRepository documentRHRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final JdbcTemplate jdbcTemplate;
    private final LlmClient llmClient;

    @Value("${rag.embedding.url:http://localhost:11434/api/embeddings}")
    private String embeddingUrl;

    @Value("${rag.embedding.model:nomic-embed-text}")
    private String embeddingModel;

    @Value("${rag.chunk.size:500}")
    private int chunkSize;

    @Value("${rag.chunk.overlap:50}")
    private int chunkOverlap;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @Async("ragExecutor")
    public void process(Long documentId, String filePath) {
        DocumentRH doc = documentRHRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + documentId));
        try {
            doc.setStatut("TRAITEMENT");
            documentRHRepository.save(doc);

            // 1. Extract text via Tika
            String text = extractText(filePath);
            if (text == null || text.isBlank()) {
                throw new RuntimeException("Aucun texte extrait du document.");
            }
            log.info("[RAG] Texte extrait — {} caractères", text.length());

            // 2. Chunk text
            List<String> chunks = chunkText(text);
            log.info("[RAG] {} chunk(s) générés", chunks.size());

            // 3. Delete old chunks if document was re-uploaded
            documentChunkRepository.deleteByDocumentId(documentId);

            // 4. For each chunk: save + embed + store vector
            for (int i = 0; i < chunks.size(); i++) {
                String chunkText = chunks.get(i);

                DocumentChunk chunk = new DocumentChunk();
                chunk.setDocument(doc);
                chunk.setContenu(chunkText);
                chunk.setChunkIndex(i);
                chunk.setAccessRole("ROLE_ADMIN"); // uploadé par admin — visible admin uniquement par défaut
                chunk = documentChunkRepository.save(chunk);

                try {
                    float[] embedding = callEmbeddingApi(chunkText);
                    storeEmbedding(chunk.getId(), embedding);
                } catch (Exception e) {
                    // Embedding failure is non-blocking: chunk is saved without vector
                    log.warn("[RAG] Embedding échoué pour chunk #{}: {}", i, e.getMessage());
                }
            }

            doc.setStatut("PRET");
            doc.setErreur(null);
            documentRHRepository.save(doc);
            log.info("[RAG] Document {} traité avec succès ({} chunks)", documentId, chunks.size());

        } catch (Exception e) {
            log.error("[RAG] Erreur traitement document {}: {}", documentId, e.getMessage(), e);
            doc.setStatut("ERREUR");
            doc.setErreur(e.getMessage());
            documentRHRepository.save(doc);
        }
    }

    // ── Text extraction ───────────────────────────────────────────────────────

    private String extractText(String filePath) throws IOException, TikaException, SAXException {
        AutoDetectParser parser = new AutoDetectParser();
        BodyContentHandler handler = new BodyContentHandler(-1); // no size limit
        Metadata metadata = new Metadata();
        ParseContext context = new ParseContext();
        try (InputStream stream = new FileInputStream(filePath)) {
            parser.parse(stream, handler, metadata, context);
        }
        return handler.toString().trim();
    }

    // ── Chunking ──────────────────────────────────────────────────────────────

    private List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            String chunk = text.substring(start, end).trim();
            if (!chunk.isBlank()) {
                chunks.add(chunk);
            }
            start += chunkSize - chunkOverlap;
        }
        return chunks;
    }

    // ── Embedding API (Ollama default) ────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private float[] callEmbeddingApi(String text) {
        Map<String, String> request = Map.of("model", embeddingModel, "prompt", text);
        Map<String, Object> response = restTemplate.postForObject(embeddingUrl, request, Map.class);
        if (response == null || !response.containsKey("embedding")) {
            throw new RuntimeException("Réponse embedding invalide");
        }
        List<Double> raw = (List<Double>) response.get("embedding");
        float[] result = new float[raw.size()];
        for (int i = 0; i < raw.size(); i++) result[i] = raw.get(i).floatValue();
        return result;
    }

    // ── pgvector storage ──────────────────────────────────────────────────────

    private void storeEmbedding(Long chunkId, float[] embedding) {
        String vectorStr = toVectorStr(embedding);
        jdbcTemplate.update(
                "UPDATE document_chunks SET embedding = CAST(? AS vector) WHERE id = ?",
                vectorStr, chunkId
        );
    }

    private String toVectorStr(float[] embedding) {
        return "[" + IntStream.range(0, embedding.length)
                .mapToObj(i -> String.valueOf(embedding[i]))
                .collect(Collectors.joining(",")) + "]";
    }

    // ── RAG Query (appelé par le chatbot employé) ─────────────────────────────

    @Override
    public String getAnswerFromRAG(String question, String userRole) {
        log.info("[RAG] Recherche sémantique pour rôle={} : {}", userRole, question);

        float[] queryEmbedding;
        try {
            queryEmbedding = callEmbeddingApi(question);
        } catch (Exception e) {
            log.warn("[RAG] Embedding de la question échoué : {}", e.getMessage());
            return "Le service de recherche est temporairement indisponible.";
        }

        String vectorStr = toVectorStr(queryEmbedding);

        // ROLE_ADMIN voit tous les chunks ; ROLE_EMPLOYE uniquement les chunks marqués ROLE_EMPLOYE
        String sql = "ROLE_ADMIN".equals(userRole)
                ? """
                  SELECT c.contenu, d.nom AS doc_nom
                  FROM document_chunks c
                  JOIN documents_rh d ON c.document_id = d.id
                  WHERE d.statut = 'PRET' AND c.embedding IS NOT NULL
                  ORDER BY c.embedding <=> CAST(? AS vector)
                  LIMIT 5
                  """
                : """
                  SELECT c.contenu, d.nom AS doc_nom
                  FROM document_chunks c
                  JOIN documents_rh d ON c.document_id = d.id
                  WHERE d.statut = 'PRET' AND c.embedding IS NOT NULL
                    AND (c.access_role = 'ROLE_EMPLOYE' OR c.access_role IS NULL)
                  ORDER BY c.embedding <=> CAST(? AS vector)
                  LIMIT 5
                  """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, vectorStr);

        if (rows.isEmpty()) {
            return "Je n'ai pas trouvé d'information pertinente dans les documents RH disponibles.";
        }

        String context = rows.stream()
                .map(r -> (String) r.get("contenu"))
                .collect(Collectors.joining("\n---\n"));

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                        "Tu es un assistant RH expert. Réponds en français à la question en te basant "
                        + "uniquement sur le contexte fourni. Si la réponse n'est pas dans le contexte, "
                        + "dis-le clairement sans inventer."),
                Map.of("role", "user", "content",
                        "Contexte extrait des documents RH :\n" + context + "\n\nQuestion : " + question)
        );

        try {
            return llmClient.complete(messages);
        } catch (Exception e) {
            log.error("[RAG] LLM échoué : {}", e.getMessage());
            return "Le service de génération de réponse est temporairement indisponible.";
        }
    }
}
