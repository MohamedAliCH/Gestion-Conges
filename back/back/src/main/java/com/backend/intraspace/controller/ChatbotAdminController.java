package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.ChatbotRequest;
import com.backend.intraspace.dtos.ChatbotResponse;
import com.backend.intraspace.entities.ChatbotConversation;
import com.backend.intraspace.repositories.ChatbotConversationRepository;
import com.backend.intraspace.services.ChatbotAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;
import java.util.List;
import java.util.concurrent.Executor;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotAdminController {

    private final ChatbotAdminService chatbotAdminService;
    private final ChatbotConversationRepository conversationRepository;
    private final Executor ragExecutor;

    /**
     * POST /api/chatbot/admin
     * Reçoit la question, exécute le pipeline Text-to-SQL, retourne JSON.
     */
    @PostMapping("/admin")
    public ResponseEntity<ChatbotResponse> ask(
            @RequestBody ChatbotRequest request,
            Principal principal) {
        ChatbotResponse response = chatbotAdminService.ask(request.getQuestion(), principal.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/chatbot/admin/stream
     * Même pipeline mais la réponse NL est streamée token par token via SSE.
     */
    @PostMapping(value = "/admin/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAsk(
            @RequestBody ChatbotRequest request,
            Principal principal) {
        SseEmitter emitter = new SseEmitter(120_000L);
        ragExecutor.execute(() ->
                chatbotAdminService.streamAsk(request.getQuestion(), principal.getName(), emitter)
        );
        return emitter;
    }

    /**
     * GET /api/chatbot/admin/history
     * Historique des conversations de l'admin connecté.
     */
    @GetMapping("/admin/history")
    public ResponseEntity<List<ChatbotConversation>> history(Principal principal) {
        return ResponseEntity.ok(
                conversationRepository.findByUserEmailOrderByCreatedAtDesc(principal.getName())
        );
    }
}
