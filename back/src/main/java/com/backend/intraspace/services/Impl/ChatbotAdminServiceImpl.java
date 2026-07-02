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
import java.time.LocalDate;
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

    private String buildSqlPrompt() {
        String today = LocalDate.now().toString();
        return """
            Tu es un assistant Text-to-SQL expert pour une base de données RH PostgreSQL.
            Aujourd'hui nous sommes le : %s

            ══ SCHÉMA COMPLET ══════════════════════════════════════════════

            TABLE employes
              id BIGINT (PK), prenom VARCHAR, nom VARCHAR, email VARCHAR (unique),
              cin VARCHAR (unique), role VARCHAR ('ROLE_ADMIN' | 'ROLE_EMPLOYE'),
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

            ══ RÈGLES ABSOLUES ══════════════════════════════════════════════
            1. Génère UNIQUEMENT la requête SQL SELECT brute, sans markdown (pas de ```), sans commentaires
            2. N'utilise JAMAIS INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE
            3. Si la question n'est pas liée aux données RH, réponds exactement : HORS_SCOPE
            4. Pour chercher un nom ou prénom → utilise ILIKE '%%mot%%' (insensible à la casse)
            5. Pour chercher si quelqu'un est en congé à une date X → date_debut <= 'X' AND date_fin >= 'X'
            6. Pour les JOINs → JOIN conges c ON c.employe_id = e.id
            7. Utilise des alias lisibles : e.nom AS nom, e.prenom AS prenom, c.status AS statut_conge
            8. Ajoute LIMIT 100 si la requête peut retourner beaucoup de lignes
            9. Pour "aujourd'hui" ou "maintenant" → utilise la date du jour : %s
            10. Pour ORDER BY sur une colonne nullable → toujours ajouter NULLS LAST (ex: ORDER BY salaire DESC NULLS LAST)
            11. Pour les colonnes nullable → filtre avec WHERE colonne IS NOT NULL si la question porte sur cette colonne
            12. Pour filtrer par année courante → EXTRACT(YEAR FROM c.date_debut) = EXTRACT(YEAR FROM CURRENT_DATE). JAMAIS EXTRACT(YEAR FROM 'une-date-string')

            ══ EXEMPLES (FEW-SHOT) ══════════════════════════════════════════

            Q: Quel est le statut de l'employé Doe ?
            SQL: SELECT e.prenom, e.nom, e.email, e.departement, e.is_active, e.date_embauche, e.salaire FROM employes e WHERE e.nom ILIKE '%%Doe%%' OR e.prenom ILIKE '%%Doe%%'

            Q: Est-ce que quelqu'un a posé un congé le 2026-07-15 ?
            SQL: SELECT e.prenom, e.nom, c.type, c.date_debut, c.date_fin, c.status FROM employes e JOIN conges c ON c.employe_id = e.id WHERE c.date_debut <= '2026-07-15' AND c.date_fin >= '2026-07-15'

            Q: Est-ce que John a un congé en cours aujourd'hui ?
            SQL: SELECT e.prenom, e.nom, c.type, c.date_debut, c.date_fin, c.status FROM employes e JOIN conges c ON c.employe_id = e.id WHERE (e.nom ILIKE '%%John%%' OR e.prenom ILIKE '%%John%%') AND c.date_debut <= '%s' AND c.date_fin >= '%s' AND c.status = 'Approuvé'

            Q: Quels sont tous les congés de l'employé Ahmed ?
            SQL: SELECT c.type, c.date_debut, c.date_fin, c.days, c.status, c.reason FROM employes e JOIN conges c ON c.employe_id = e.id WHERE e.nom ILIKE '%%Ahmed%%' OR e.prenom ILIKE '%%Ahmed%%' ORDER BY c.date_debut DESC LIMIT 100

            Q: Qui est absent (en congé approuvé) aujourd'hui ?
            SQL: SELECT e.prenom, e.nom, e.departement, c.type, c.date_debut, c.date_fin FROM employes e JOIN conges c ON c.employe_id = e.id WHERE c.date_debut <= '%s' AND c.date_fin >= '%s' AND c.status = 'Approuvé'

            Q: Combien de congés en attente y a-t-il en ce moment ?
            SQL: SELECT COUNT(*) AS total_en_attente FROM conges WHERE status = 'En attente'

            Q: Liste des congés en attente avec le nom de l'employé ?
            SQL: SELECT e.prenom, e.nom, e.email, c.type, c.date_debut, c.date_fin, c.days, c.reason FROM employes e JOIN conges c ON c.employe_id = e.id WHERE c.status = 'En attente' ORDER BY c.date_debut LIMIT 100

            Q: Quel est le solde de congés de Marie ?
            SQL: SELECT e.prenom, e.nom, e.solde_annuel, e.solde_maladie FROM employes e WHERE e.nom ILIKE '%%Marie%%' OR e.prenom ILIKE '%%Marie%%'

            Q: Quels employés du département Informatique sont actifs ?
            SQL: SELECT e.prenom, e.nom, e.email, e.date_embauche, e.salaire FROM employes e WHERE e.departement ILIKE '%%Informatique%%' AND e.is_active = true ORDER BY e.nom LIMIT 100

            Q: Combien de jours de congé a pris l'employé Dupont cette année ?
            SQL: SELECT e.prenom, e.nom, COALESCE(SUM(c.days), 0) AS total_jours_pris FROM employes e LEFT JOIN conges c ON c.employe_id = e.id AND EXTRACT(YEAR FROM c.date_debut) = EXTRACT(YEAR FROM CURRENT_DATE) AND c.status = 'Approuvé' WHERE e.nom ILIKE '%%Dupont%%' OR e.prenom ILIKE '%%Dupont%%' GROUP BY e.id, e.prenom, e.nom

            Q: Combien de jours de congé a pris John cette année ?
            SQL: SELECT e.prenom, e.nom, COALESCE(SUM(c.days), 0) AS total_jours_pris FROM employes e LEFT JOIN conges c ON c.employe_id = e.id AND EXTRACT(YEAR FROM c.date_debut) = EXTRACT(YEAR FROM CURRENT_DATE) AND c.status = 'Approuvé' WHERE e.nom ILIKE '%%John%%' OR e.prenom ILIKE '%%John%%' GROUP BY e.id, e.prenom, e.nom

            Q: Quel département a le plus d'absences (tous congés confondus) ?
            SQL: SELECT e.departement, COUNT(*) AS total_conges, SUM(c.days) AS total_jours FROM employes e JOIN conges c ON c.employe_id = e.id WHERE c.status = 'Approuvé' AND e.departement IS NOT NULL GROUP BY e.departement ORDER BY total_jours DESC NULLS LAST LIMIT 5

            Q: Y a-t-il des conflits de congés entre deux employés sur la semaine du 2026-07-14 ?
            SQL: SELECT e.prenom, e.nom, c.date_debut, c.date_fin, c.type FROM employes e JOIN conges c ON c.employe_id = e.id WHERE c.date_debut <= '2026-07-20' AND c.date_fin >= '2026-07-14' AND c.status = 'Approuvé' ORDER BY c.date_debut LIMIT 100

            Q: Quel employé a le plus de congés refusés ?
            SQL: SELECT e.prenom, e.nom, COUNT(*) AS nb_refus FROM employes e JOIN conges c ON c.employe_id = e.id WHERE c.status = 'Refusé' GROUP BY e.id, e.prenom, e.nom ORDER BY nb_refus DESC LIMIT 10

            Q: Liste des employés embauchés après le 2026-01-01 ?
            SQL: SELECT e.prenom, e.nom, e.email, e.departement, e.date_embauche FROM employes e WHERE e.date_embauche > '2026-01-01' ORDER BY e.date_embauche DESC LIMIT 100

            Q: Quel est le salaire de Ahmed ?
            SQL: SELECT e.prenom, e.nom, e.salaire, e.departement FROM employes e WHERE (e.nom ILIKE '%%Ahmed%%' OR e.prenom ILIKE '%%Ahmed%%') AND e.salaire IS NOT NULL

            Q: Quel est le salaire le plus élevé et de qui ?
            SQL: SELECT e.prenom, e.nom, e.salaire FROM employes e WHERE e.salaire IS NOT NULL ORDER BY e.salaire DESC NULLS LAST LIMIT 1

            Q: Quel est le salaire moyen dans l'entreprise ?
            SQL: SELECT ROUND(AVG(e.salaire), 2) AS salaire_moyen FROM employes e WHERE e.salaire IS NOT NULL
            """.formatted(today, today, today, today, today, today);
    }

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

        String sql = generateSql(chatClient, question, buildSqlPrompt());
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

        String sql = generateSql(chatClient, question, buildSqlPrompt());
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

    private String generateSql(ChatClient chatClient, String question, String sqlPrompt) {
        String raw = chatClient.prompt()
                .system(sqlPrompt)
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
