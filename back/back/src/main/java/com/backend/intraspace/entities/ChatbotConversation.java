package com.backend.intraspace.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chatbot_conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "sql_generated", columnDefinition = "TEXT")
    private String sqlGenerated;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String response;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
