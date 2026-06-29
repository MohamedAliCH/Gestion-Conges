package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.ChatbotRequest;
import com.backend.intraspace.dtos.ChatbotResponse;
import com.backend.intraspace.entities.ChatbotConversation;
import com.backend.intraspace.repositories.ChatbotConversationRepository;
import com.backend.intraspace.services.ChatbotAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;
import java.util.List;
import java.util.concurrent.Executor;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ChatbotAdminController {

    private final ChatbotAdminService chatbotAdminService;
    private final ChatbotConversationRepository conversationRepository;
    private final Executor ragExecutor;

    @PostMapping("/admin")
    public ResponseEntity<ChatbotResponse> ask(
            @RequestBody ChatbotRequest request,
            Principal principal) {
        return ResponseEntity.ok(chatbotAdminService.ask(request.getQuestion(), principal.getName()));
    }

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

    @GetMapping("/admin/history")
    public ResponseEntity<List<ChatbotConversation>> history(Principal principal) {
        return ResponseEntity.ok(
                conversationRepository.findByUserEmailOrderByCreatedAtDesc(principal.getName())
        );
    }
}
