package com.backend.intraspace.services.Impl;

import com.backend.intraspace.dtos.ChatbotResponse;
import com.backend.intraspace.entities.ChatbotConversation;
import com.backend.intraspace.repositories.ChatbotConversationRepository;
import com.backend.intraspace.services.ChatbotAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotAdminServiceImpl implements ChatbotAdminService {

    private final ChatClient.Builder chatClientBuilder;
    private final JdbcTemplate jdbcTemplate;
    private final ChatbotConversationRepository conversationRepository;

    // ── System prompts ────────────────────────────────────────────────────────

    private static final String SQL_SYSTEM_PROMPT = """
            Tu es un assistant Text-to-SQL expert pour une base de données RH PostgreSQL.

            SCHÉMA COMPLET DE LA BASE :

            TABLE employes
              id BIGINT (PK), prenom VARCHAR, nom VARCHAR, email VARCHAR (unique),
              cin VARCHAR (unique), role VARCHAR ('ROLE_ADMIN' ou 'ROLE_EMPLOYE'),
              is_active BOOLEAN, created_at DATE, phone VARCHAR, address VARCHAR,
              date_embauche DATE, solde_annuel INTEGER, solde_maladie INTEGER,
              salaire NUMERIC(10,2), departement VARCHAR

            TABLE conges
              id BIGINT (PK), employe_id BIGINT (FK → employes.id),
              type VARCHAR ('Congé Annuel' | 'Congé Maladie' | 'Congé Exceptionnel'),
              date_debut DATE, date_fin DATE, days INTEGER,
              status VARCHAR ('En attente' | 'Approuvé' | 'Refusé'),
              reason VARCHAR, refus_motif VARCHAR

            TABLE documents
              id BIGINT (PK), file_name VARCHAR, file_type VARCHAR,
              upload_date DATE, status VARCHAR ('INDEXED' | 'ERROR' | 'PROCESSING'),
              file_path VARCHAR, access_role VARCHAR ('ROLE_ADMIN' | 'ROLE_EMPLOYE')

            RÈGLES ABSOLUES :
            1. Génère UNIQUEMENT la requête SQL SELECT brute, sans markdown (pas de ```), sans commentaires
            2. N'utilise JAMAIS INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE
            3. Si la question n'est pas liée aux données RH, réponds exactement le mot : HORS_SCOPE
            4. Utilise des alias lisibles (ex: e.nom AS nom_employe)
            5. Ajoute toujours LIMIT 100 si la requête peut retourner beaucoup de lignes
            """;

    private static final String NL_SYSTEM_PROMPT = """
            Tu es un assistant RH professionnel et concis.
            On te donne une question RH et les résultats de la requête SQL exécutée sur la base.
            Formule une réponse claire, naturelle et en français, en 1 à 3 phrases.
            Ne mentionne pas le SQL, ne répète pas les données brutes inutilement.
            Si les résultats sont vides, dis qu'aucune donnée ne correspond.
            """;

    // ── Public API ────────────────────────────────────────────────────────────

    @Override
    public ChatbotResponse ask(String question, String adminEmail) {
        log.info("[Chatbot] Question de '{}' : {}", adminEmail, question);
        ChatClient chatClient = chatClientBuilder.build();

        String sql = generateSql(chatClient, question);
        if ("HORS_SCOPE".equalsIgnoreCase(sql)) {
            return ChatbotResponse.outOfScope();
        }

        try {
            validateSql(sql);
        } catch (SecurityException e) {
            log.warn("[Chatbot] SQL rejeté (sécurité) : {}", e.getMessage());
            return ChatbotResponse.sqlError(sql, e.getMessage());
        }

        List<Map<String, Object>> results;
        try {
            results = jdbcTemplate.queryForList(addLimitIfAbsent(sql));
        } catch (Exception e) {
            log.error("[Chatbot] Erreur exécution SQL : {}", e.getMessage());
            return ChatbotResponse.sqlError(sql, e.getMessage());
        }

        String nlResponse = generateNlResponse(chatClient, question, sql, results);
        save(adminEmail, question, sql, nlResponse);

        log.info("[Chatbot] Réponse générée — {} ligne(s) SQL", results.size());
        return new ChatbotResponse(nlResponse, sql, null);
    }

    @Override
    public void streamAsk(String question, String adminEmail, SseEmitter emitter) {
        ChatClient chatClient = chatClientBuilder.build();

        String sql = generateSql(chatClient, question);
        if ("HORS_SCOPE".equalsIgnoreCase(sql)) {
            sendAndComplete(emitter, "Je ne peux répondre qu'aux questions sur les données RH.");
            return;
        }

        try {
            validateSql(sql);
        } catch (SecurityException e) {
            sendAndComplete(emitter, "Requête SQL rejetée pour des raisons de sécurité : " + e.getMessage());
            return;
        }

        List<Map<String, Object>> results;
        try {
            results = jdbcTemplate.queryForList(addLimitIfAbsent(sql));
        } catch (Exception e) {
            sendAndComplete(emitter, "Erreur d'exécution SQL : " + e.getMessage());
            return;
        }

        String userContent = buildNlUserContent(question, sql, results);
        StringBuilder full = new StringBuilder();

        try {
            chatClient.prompt()
                    .system(NL_SYSTEM_PROMPT)
                    .user(userContent)
                    .stream()
                    .content()
                    .doOnNext(token -> {
                        full.append(token);
                        try {
                            emitter.send(SseEmitter.event().data(token));
                        } catch (IOException ex) {
                            throw new RuntimeException(ex);
                        }
                    })
                    .doOnComplete(() -> {
                        save(adminEmail, question, sql, full.toString());
                        emitter.complete();
                    })
                    .doOnError(emitter::completeWithError)
                    .blockLast();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }

    // ── SQL Generation ────────────────────────────────────────────────────────

    private String generateSql(ChatClient chatClient, String question) {
        String raw = chatClient.prompt()
                .system(SQL_SYSTEM_PROMPT)
                .user(question)
                .call()
                .content();
        return extractSql(raw);
    }

    private String extractSql(String raw) {
        String sql = raw.replaceAll("(?i)```sql\\s*", "")
                        .replaceAll("```\\s*", "")
                        .trim();
        int semi = sql.indexOf(';');
        if (semi > 0) sql = sql.substring(0, semi).trim();
        return sql.trim();
    }

    // ── SQL Validation ────────────────────────────────────────────────────────

    private void validateSql(String sql) {
        String up = sql.strip().toUpperCase();
        if (!up.startsWith("SELECT")) {
            throw new SecurityException("Seules les requêtes SELECT sont autorisées.");
        }
        List<String> forbidden = List.of(
                "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
                "TRUNCATE", "EXEC", "EXECUTE", "CALL", "GRANT", "REVOKE",
                "COPY", "--", "/*"
        );
        for (String kw : forbidden) {
            if (up.contains(kw)) {
                throw new SecurityException("Instruction interdite détectée : " + kw);
            }
        }
    }

    private String addLimitIfAbsent(String sql) {
        if (!sql.toUpperCase().contains("LIMIT")) {
            return sql + " LIMIT 100";
        }
        return sql;
    }

    // ── NL Response ───────────────────────────────────────────────────────────

    private String generateNlResponse(ChatClient chatClient, String question, String sql,
                                       List<Map<String, Object>> results) {
        return chatClient.prompt()
                .system(NL_SYSTEM_PROMPT)
                .user(buildNlUserContent(question, sql, results))
                .call()
                .content();
    }

    private String buildNlUserContent(String question, String sql, List<Map<String, Object>> results) {
        return String.format(
                "Question : %s\n\nRésultats (%d ligne(s)) :\n%s",
                question, results.size(), formatResults(results)
        );
    }

    private String formatResults(List<Map<String, Object>> results) {
        if (results.isEmpty()) return "Aucun résultat.";
        List<Map<String, Object>> display = results.size() > 50 ? results.subList(0, 50) : results;
        String rows = display.stream()
                .map(row -> row.entrySet().stream()
                        .map(e -> e.getKey() + ": " + e.getValue())
                        .collect(Collectors.joining(", ")))
                .collect(Collectors.joining("\n"));
        if (results.size() > 50) {
            rows += "\n... (" + (results.size() - 50) + " lignes supplémentaires)";
        }
        return rows;
    }

    // ── Persistence ───────────────────────────────────────────────────────────

    private void save(String email, String question, String sql, String response) {
        ChatbotConversation conv = new ChatbotConversation();
        conv.setUserEmail(email);
        conv.setQuestion(question);
        conv.setSqlGenerated(sql);
        conv.setResponse(response);
        conv.setCreatedAt(LocalDateTime.now());
        conversationRepository.save(conv);
    }

    private void sendAndComplete(SseEmitter emitter, String message) {
        try {
            emitter.send(SseEmitter.event().data(message));
            emitter.complete();
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }
}
