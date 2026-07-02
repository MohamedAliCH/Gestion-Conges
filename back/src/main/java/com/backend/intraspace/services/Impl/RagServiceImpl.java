package com.backend.intraspace.services.Impl;

import com.backend.intraspace.services.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagServiceImpl implements RagService {

    private final VectorStore vectorStore;
    private final ChatClient.Builder chatClientBuilder;

    private static final String SYSTEM_PROMPT =
            "Tu es un assistant RH virtuel de l'entreprise IntraSpace. " +
            "Réponds à la question de l'employé en te basant uniquement sur le contexte ci-dessous. " +
            "Si la réponse n'est pas dans le contexte, dis poliment que tu ne sais pas. " +
            "À la fin de ta réponse, ajoute toujours une ligne vide puis '📄 Sources : ' " +
            "suivi de la liste des noms de fichiers utilisés (fournis dans le contexte entre crochets).\n\n" +
            "CONTEXTE :\n{context}";

    @Override
    public String getAnswerFromRAG(String question, String userRole) {
        List<Document> documents = searchDocuments(question, userRole);

        if (documents.isEmpty()) {
            return "Désolé, je ne trouve pas d'informations RH pertinentes pour répondre à votre question.";
        }

        String context = buildContextWithSources(documents);

        ChatClient chatClient = chatClientBuilder.build();
        return chatClient.prompt()
                .system(sp -> sp.text(SYSTEM_PROMPT).param("context", context))
                .user(question)
                .call()
                .content();
    }

    @Override
    public void streamAnswer(String question, String userRole, SseEmitter emitter) {
        try {
            List<Document> documents = searchDocuments(question, userRole);

            if (documents.isEmpty()) {
                emitter.send(SseEmitter.event()
                        .data("Désolé, je ne trouve pas d'informations RH pertinentes pour répondre à votre question."));
                emitter.complete();
                return;
            }

            String context = buildContextWithSources(documents);

            ChatClient chatClient = chatClientBuilder.build();
            chatClient.prompt()
                    .system(sp -> sp.text(SYSTEM_PROMPT).param("context", context))
                    .user(question)
                    .stream()
                    .content()
                    .subscribe(
                            chunk -> {
                                try {
                                    emitter.send(SseEmitter.event().data(chunk));
                                } catch (IOException e) {
                                    log.warn("[RAG-STREAM] Client disconnected: {}", e.getMessage());
                                    emitter.completeWithError(e);
                                }
                            },
                            error -> {
                                log.error("[RAG-STREAM] Streaming error: {}", error.getMessage());
                                emitter.completeWithError(error);
                            },
                            emitter::complete
                    );
        } catch (Exception e) {
            log.error("[RAG-STREAM] Error: {}", e.getMessage(), e);
            emitter.completeWithError(e);
        }
    }

    /**
     * Recherche les documents pertinents dans le VectorStore avec filtre d'accès.
     */
    private List<Document> searchDocuments(String question, String userRole) {
        SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
                .query(question)
                .topK(3)
                .similarityThreshold(0.75);

        if (!"ROLE_ADMIN".equals(userRole)) {
            FilterExpressionBuilder builder = new FilterExpressionBuilder();
            searchRequestBuilder = searchRequestBuilder
                    .filterExpression(builder.eq("access_role", "ROLE_EMPLOYE").build());
        }

        return vectorStore.similaritySearch(searchRequestBuilder.build());
    }

    /**
     * Construit le contexte en ajoutant le nom du fichier source entre crochets
     * devant chaque chunk, pour que le LLM puisse citer ses sources.
     */
    private String buildContextWithSources(List<Document> documents) {
        Set<String> sourceFiles = new LinkedHashSet<>();
        StringBuilder sb = new StringBuilder();

        for (Document doc : documents) {
            String fileName = (String) doc.getMetadata().getOrDefault("file_name", "document inconnu");
            sourceFiles.add(fileName);
            sb.append("[Source : ").append(fileName).append("]\n");
            sb.append(doc.getFormattedContent()).append("\n\n");
        }

        return sb.toString();
    }
}
