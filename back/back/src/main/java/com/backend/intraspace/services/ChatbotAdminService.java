package com.backend.intraspace.services;

import com.backend.intraspace.dtos.ChatbotResponse;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface ChatbotAdminService {

    /** Text-to-SQL: generate SQL from question, execute, return NL response. */
    ChatbotResponse ask(String question, String adminEmail);

    /** Same flow but streams the final NL response token-by-token via SSE. */
    void streamAsk(String question, String adminEmail, SseEmitter emitter);
}
