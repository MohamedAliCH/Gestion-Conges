package com.backend.intraspace.services;

public interface RagService {
    String getAnswerFromRAG(String question, String userRole);
}