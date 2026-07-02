package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.ChatbotRequest;
import com.backend.intraspace.entities.ChatbotConversation;
import com.backend.intraspace.repositories.ChatbotConversationRepository;
import com.backend.intraspace.services.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/chatbot/employe")
@RequiredArgsConstructor
@Slf4j
public class ChatbotEmployeController {

    private final RagService ragService;
    private final Executor ragExecutor;

    // ── Rate limiting: max 10 requests per minute per user ──────────────────
    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final long WINDOW_MS = 60_000L;
    private final ConcurrentHashMap<String, RateWindow> rateLimiter = new ConcurrentHashMap<>();

    @PostMapping()
    public ResponseEntity<?> askEmployee(@RequestBody ChatbotRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        // Rate limit check
        if (isRateLimited(userEmail)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Trop de requêtes. Veuillez attendre une minute avant de réessayer."));
        }

        String response = ragService.getAnswerFromRAG(request.getQuestion(), role);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEmployee(@RequestBody ChatbotRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        SseEmitter emitter = new SseEmitter(120_000L);

        if (isRateLimited(userEmail)) {
            ragExecutor.execute(() -> {
                try {
                    emitter.send(SseEmitter.event()
                            .data("Trop de requêtes. Veuillez attendre une minute avant de réessayer."));
                    emitter.complete();
                } catch (Exception e) {
                    emitter.completeWithError(e);
                }
            });
            return emitter;
        }

        ragExecutor.execute(() ->
                ragService.streamAnswer(request.getQuestion(), role, emitter)
        );
        return emitter;
    }

    // ── Simple sliding-window rate limiter ───────────────────────────────────
    private boolean isRateLimited(String userEmail) {
        long now = System.currentTimeMillis();
        RateWindow window = rateLimiter.compute(userEmail, (key, existing) -> {
            if (existing == null || now - existing.windowStart > WINDOW_MS) {
                return new RateWindow(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });
        return window.count.get() > MAX_REQUESTS_PER_MINUTE;
    }

    private static class RateWindow {
        final long windowStart;
        final AtomicInteger count;

        RateWindow(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
