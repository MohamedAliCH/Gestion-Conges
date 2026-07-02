package com.backend.intraspace.services.Impl;

import com.backend.intraspace.entities.ChatbotConversation;
import com.backend.intraspace.repositories.ChatbotConversationRepository;
import com.backend.intraspace.services.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RagServiceImpl implements RagService {

    private static final int HISTORY_TURNS = 4;

    private final VectorStore vectorStore;
    private final ChatClient.Builder chatClientBuilder;
    private final ChatbotConversationRepository conversationRepository;

    @Override
    public String getAnswerFromRAG(String question, String userRole, String userEmail) {
        SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
                .query(question)
                .topK(3)
                .similarityThreshold(0.75);

        if (!"ROLE_ADMIN".equals(userRole)) {
            FilterExpressionBuilder fb = new FilterExpressionBuilder();
            searchRequestBuilder = searchRequestBuilder
                    .filterExpression(fb.eq("access_role", "ROLE_EMPLOYE").build());
        }

        List<Document> documents = vectorStore.similaritySearch(searchRequestBuilder.build());

        String answer;
        if (documents.isEmpty()) {
            answer = "Désolé, je ne trouve pas d'informations RH pertinentes pour répondre à votre question.";
        } else {
            String context = documents.stream()
                    .map(Document::getFormattedContent)
                    .collect(Collectors.joining("\n\n"));

            List<Message> history = buildHistoryMessages(userEmail);

            ChatClient chatClient = chatClientBuilder.build();
            answer = chatClient.prompt()
                    .system(sp -> sp.text(
                            "Tu es un assistant RH virtuel de l'entreprise IntraSpace. " +
                            "Réponds à la question de l'employé en te basant uniquement sur le contexte ci-dessous. " +
                            "Si la réponse n'est pas dans le contexte, dis poliment que tu ne sais pas.\n\n" +
                            "CONTEXTE :\n{context}")
                            .param("context", context))
                    .messages(history)
                    .user(question)
                    .call()
                    .content();
        }

        save(userEmail, question, answer);
        return answer;
    }

    private List<Message> buildHistoryMessages(String userEmail) {
        List<ChatbotConversation> recent = conversationRepository.findByUserEmailOrderByCreatedAtDesc(
                userEmail,
                PageRequest.of(0, HISTORY_TURNS, Sort.by("createdAt").descending()));

        // oldest first so the LLM sees the conversation in chronological order
        Collections.reverse(recent);

        List<Message> messages = new ArrayList<>();
        for (ChatbotConversation conv : recent) {
            messages.add(new UserMessage(conv.getQuestion()));
            messages.add(new AssistantMessage(conv.getResponse()));
        }
        return messages;
    }

    private void save(String email, String question, String response) {
        ChatbotConversation conv = new ChatbotConversation();
        conv.setUserEmail(email);
        conv.setQuestion(question);
        conv.setResponse(response);
        conv.setCreatedAt(LocalDateTime.now());
        conversationRepository.save(conv);
    }
}
