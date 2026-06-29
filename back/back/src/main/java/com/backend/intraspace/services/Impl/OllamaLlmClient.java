package com.backend.intraspace.services.Impl;

import com.backend.intraspace.services.LlmClient;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Service
@Slf4j
public class OllamaLlmClient implements LlmClient {

    @Value("${rag.chat.url:http://localhost:11434/api/chat}")
    private String chatUrl;

    @Value("${rag.chat.model:llama3}")
    private String chatModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @SuppressWarnings("unchecked")
    public String complete(List<Map<String, String>> messages) {
        Map<String, Object> body = Map.of(
                "model", chatModel,
                "messages", messages,
                "stream", false
        );
        try {
            Map<String, Object> response = restTemplate.postForObject(chatUrl, body, Map.class);
            if (response == null) throw new RuntimeException("Réponse LLM nulle.");
            Map<String, String> message = (Map<String, String>) response.get("message");
            return message.get("content").trim();
        } catch (Exception e) {
            log.error("[LLM] Erreur complete: {}", e.getMessage(), e);
            throw new RuntimeException("Service LLM indisponible : " + e.getMessage(), e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public void streamComplete(List<Map<String, String>> messages, Consumer<String> tokenConsumer) {
        Map<String, Object> body = Map.of(
                "model", chatModel,
                "messages", messages,
                "stream", true
        );
        try {
            final byte[] bodyBytes = objectMapper.writeValueAsBytes(body);
            restTemplate.execute(
                    chatUrl,
                    HttpMethod.POST,
                    req -> {
                        req.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                        req.getBody().write(bodyBytes);
                    },
                    res -> {
                        try (BufferedReader reader = new BufferedReader(
                                new InputStreamReader(res.getBody(), StandardCharsets.UTF_8))) {
                            String line;
                            while ((line = reader.readLine()) != null) {
                                if (line.isBlank()) continue;
                                try {
                                    Map<String, Object> chunk = objectMapper.readValue(line, Map.class);
                                    if (Boolean.TRUE.equals(chunk.get("done"))) break;
                                    Map<String, String> msg = (Map<String, String>) chunk.get("message");
                                    if (msg != null) {
                                        String token = msg.get("content");
                                        if (token != null && !token.isEmpty()) {
                                            tokenConsumer.accept(token);
                                        }
                                    }
                                } catch (JsonProcessingException e) {
                                    log.warn("[LLM] Ligne non parseable ignorée: {}", line);
                                }
                            }
                        }
                        return null;
                    }
            );
        } catch (Exception e) {
            log.error("[LLM] Erreur streaming: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur streaming LLM : " + e.getMessage(), e);
        }
    }
}
