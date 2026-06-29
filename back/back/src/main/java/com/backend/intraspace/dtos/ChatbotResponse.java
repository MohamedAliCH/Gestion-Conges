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
                "Je ne peux répondre qu'aux questions sur les données RH.",
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
