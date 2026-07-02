package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.ChatbotRequest;
import com.backend.intraspace.entities.ChatbotConversation;
import com.backend.intraspace.repositories.ChatbotConversationRepository;
import com.backend.intraspace.services.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot/employe")
@RequiredArgsConstructor
public class ChatbotEmployeController {

    private final RagService ragService;
    private final ChatbotConversationRepository conversationRepository;

    @PostMapping
    public ResponseEntity<String> askEmployee(@RequestBody ChatbotRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        String email = auth.getName();
        String response = ragService.getAnswerFromRAG(request.getQuestion(), role, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatbotConversation>> history() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        List<ChatbotConversation> history = conversationRepository
                .findByUserEmailOrderByCreatedAtDesc(email);
        return ResponseEntity.ok(history);
    }
}
