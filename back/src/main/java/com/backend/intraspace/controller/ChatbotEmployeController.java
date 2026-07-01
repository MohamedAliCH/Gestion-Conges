package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.ChatbotRequest;
import com.backend.intraspace.services.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot/employe")
@RequiredArgsConstructor
public class ChatbotEmployeController {

    private final RagService ragService;

    @PostMapping()
    public ResponseEntity<String> askEmployee(@RequestBody ChatbotRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        String response = ragService.getAnswerFromRAG(request.getQuestion(), role);
        return ResponseEntity.ok(response);
    }
}
