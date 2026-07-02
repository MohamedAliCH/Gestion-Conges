package com.backend.intraspace.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {
    private String response;
    private String sqlGenerated;
    private String error;

    public static ChatbotResponse outOfScope() {
        return new ChatbotResponse(
                "Cette question porte sur les politiques ou règlements RH. " +
                "Pour y répondre, utilisez le Chatbot Employé (menu Chatbot) qui a accès aux documents RH indexés. " +
                "Ce chatbot admin répond uniquement aux questions sur les données : soldes, absences, congés, salaires, employés.",
                null, null
        );
    }

    public static ChatbotResponse sqlError(String sql, String msg) {
        return new ChatbotResponse(
                "Je n'ai pas pu exécuter la requête générée : " + msg,
                sql, msg
        );
    }
}
