package com.backend.intraspace.services.Impl;

import com.backend.intraspace.services.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RagServiceImpl implements RagService {

    private final VectorStore vectorStore;
    private final ChatClient.Builder chatClientBuilder;

    @Override
    public String getAnswerFromRAG(String question, String userRole) {
        // 1. Déclarer le type comme SearchRequest.Builder (avec le .Builder à la fin)
        SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
                .query(question)
                .topK(3)
                .similarityThreshold(0.75);

        // 2. Appliquer le filtre sur le builder
        if (!"ROLE_ADMIN".equals(userRole)) {
            FilterExpressionBuilder builder = new FilterExpressionBuilder();
            searchRequestBuilder = searchRequestBuilder.filterExpression(builder.eq("access_role", "ROLE_EMPLOYE").build());
        }

        // 3. Lancer la recherche en appelant .build() sur le builder
        List<Document> documents = vectorStore.similaritySearch(searchRequestBuilder.build());

        if (documents.isEmpty()) {
            return "Désolé, je ne trouve pas d'informations RH pertinentes pour répondre à votre question.";
        }

        // ... (le reste du code reste identique)


        // Concaténation propre
        String context = documents.stream()
                .map(Document::getFormattedContent)
                .collect(Collectors.joining("\n\n"));

        // Appel Mistral AI
        ChatClient chatClient = chatClientBuilder.build();
        return chatClient.prompt()
                .system(sp -> sp.text(
                                "Tu es un assistant RH virtuel de l'entreprise IntraSpace. " +
                                        "Réponds à la question de l'employé en te basant uniquement sur le contexte ci-dessous. " +
                                        "Si la réponse n'est pas dans le contexte, dis poliment que tu ne sais pas.\n\n" +
                                        "CONTEXTE :\n{context}")
                        .param("context", context)
                )
                .user(question)
                .call()
                .content();
    }
}
