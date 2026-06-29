package com.backend.intraspace.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "document_chunks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private DocumentRH document;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Column(name = "chunk_index", nullable = false)
    private int chunkIndex;

    /**
     * Rôle minimum requis pour accéder à ce chunk via RAG.
     * ROLE_ADMIN = visible par l'admin uniquement.
     * ROLE_EMPLOYE = visible par tous les utilisateurs authentifiés.
     */
    @Column(name = "access_role")
    private String accessRole;

    // embedding (vector column) is managed via JdbcTemplate — not mapped here
}
