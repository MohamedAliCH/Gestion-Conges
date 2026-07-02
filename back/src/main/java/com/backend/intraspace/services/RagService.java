package com.backend.intraspace.services;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface RagService {
    String getAnswerFromRAG(String question, String userRole);
    void streamAnswer(String question, String userRole, SseEmitter emitter);
}