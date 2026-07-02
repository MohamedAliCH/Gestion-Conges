package com.backend.intraspace.repositories;

import com.backend.intraspace.entities.ChatbotConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ChatbotConversationRepository extends JpaRepository<ChatbotConversation, Long> {
    List<ChatbotConversation> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<ChatbotConversation> findByUserEmailOrderByCreatedAtDesc(String userEmail, Pageable pageable);
}
