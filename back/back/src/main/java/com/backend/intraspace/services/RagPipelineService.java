package com.backend.intraspace.services;

public interface RagPipelineService {
    void process(Long documentId, String filePath);

    /**
     * Recherche sémantique RAG dans les documents indexés.
     * Utilisé par le chatbot employé : ragService.getAnswerFromRAG(question, userRole).
     *
     * @param question  Question en langage naturel
     * @param userRole  ROLE_ADMIN (accès total) ou ROLE_EMPLOYE (accès filtré)
     * @return Réponse en langage naturel formulée par le LLM
     */
    String getAnswerFromRAG(String question, String userRole);
}
