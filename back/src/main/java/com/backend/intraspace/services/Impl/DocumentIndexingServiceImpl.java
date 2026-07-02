package com.backend.intraspace.services.Impl;

import com.backend.intraspace.entities.Document;
import com.backend.intraspace.repositories.DocumentRepository;
import com.backend.intraspace.services.DocumentIndexingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentIndexingServiceImpl implements DocumentIndexingService {

    private final DocumentRepository documentRepository;
    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    @Value("${rag.chunk.size:500}")
    private int chunkSize;

    @Value("${rag.chunk.overlap:50}")
    private int chunkOverlap;

    @Override
    @Async("ragExecutor")
    public void index(Long documentId, String filePath, String accessRole) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + documentId));
        try {
            // 1. Extract text via Tika
            String text = extractText(filePath);
            if (text == null || text.isBlank()) {
                throw new RuntimeException("Aucun texte extrait du document.");
            }
            log.info("[RAG] Texte extrait — {} caractères", text.length());

            // 2. Chunk text using sliding window
            List<String> chunks = chunkText(text);
            log.info("[RAG] {} chunk(s) générés", chunks.size());

            // 3. Delete old vectors for this document if re-uploaded
            jdbcTemplate.update(
                    "DELETE FROM vector_store WHERE metadata->>'doc_id' = ?",
                    String.valueOf(documentId)
            );

            // 4. Build Spring AI Document list with metadata and add to VectorStore
            // Spring AI handles embedding + pgvector storage automatically
            List<org.springframework.ai.document.Document> aiDocs = new ArrayList<>();
            for (int i = 0; i < chunks.size(); i++) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("doc_id", String.valueOf(documentId));
                metadata.put("access_role", accessRole);
                metadata.put("file_name", doc.getFileName());
                metadata.put("chunk_index", String.valueOf(i));
                aiDocs.add(new org.springframework.ai.document.Document(chunks.get(i), metadata));
            }
            vectorStore.add(aiDocs);

            doc.setStatus("INDEXED");
            documentRepository.save(doc);
            log.info("[RAG] Document {} indexé avec succès ({} chunks)", documentId, chunks.size());

        } catch (Exception e) {
            log.error("[RAG] Erreur indexation document {}: {}", documentId, e.getMessage(), e);
            doc.setStatus("ERROR");
            documentRepository.save(doc);
        }
    }

    private String extractText(String filePath) throws IOException, TikaException, SAXException {
        AutoDetectParser parser = new AutoDetectParser();
        BodyContentHandler handler = new BodyContentHandler(-1);
        Metadata metadata = new Metadata();
        ParseContext context = new ParseContext();
        try (InputStream stream = new FileInputStream(filePath)) {
            parser.parse(stream, handler, metadata, context);
        }
        return handler.toString().trim();
    }

    /**
     * Découpe intelligente du texte en respectant les limites de paragraphes et de phrases.
     * Évite de couper au milieu d'une phrase pour améliorer la qualité des réponses RAG.
     */
    private List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();

        // 1. Split by paragraphs first (double newline or more)
        String[] paragraphs = text.split("\\n\\s*\\n");
        StringBuilder currentChunk = new StringBuilder();

        for (String paragraph : paragraphs) {
            String trimmed = paragraph.trim();
            if (trimmed.isBlank()) continue;

            // If adding this paragraph exceeds chunk size, finalize current chunk
            if (currentChunk.length() + trimmed.length() > chunkSize && currentChunk.length() > 0) {
                chunks.add(currentChunk.toString().trim());
                // Keep overlap: take the last `chunkOverlap` characters from the end
                String overlap = currentChunk.length() > chunkOverlap
                        ? currentChunk.substring(currentChunk.length() - chunkOverlap)
                        : currentChunk.toString();
                currentChunk = new StringBuilder(overlap);
            }

            // If a single paragraph is larger than chunkSize, split it by sentences
            if (trimmed.length() > chunkSize) {
                String[] sentences = trimmed.split("(?<=[.!?])\\s+");
                for (String sentence : sentences) {
                    if (currentChunk.length() + sentence.length() > chunkSize && currentChunk.length() > 0) {
                        chunks.add(currentChunk.toString().trim());
                        String overlap = currentChunk.length() > chunkOverlap
                                ? currentChunk.substring(currentChunk.length() - chunkOverlap)
                                : currentChunk.toString();
                        currentChunk = new StringBuilder(overlap);
                    }
                    if (currentChunk.length() > 0) currentChunk.append(" ");
                    currentChunk.append(sentence);
                }
            } else {
                if (currentChunk.length() > 0) currentChunk.append("\n\n");
                currentChunk.append(trimmed);
            }
        }

        // Don't forget the last chunk
        if (currentChunk.length() > 0 && !currentChunk.toString().isBlank()) {
            chunks.add(currentChunk.toString().trim());
        }

        return chunks;
    }
}
