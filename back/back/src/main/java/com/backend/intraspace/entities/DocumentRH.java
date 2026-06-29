package com.backend.intraspace.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents_rh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRH {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String nom;

    @Column(name = "chemin_fichier", nullable = false, length = 1000)
    private String cheminFichier;

    @Column(name = "type_mime", nullable = false)
    private String typeMime;

    @Column(nullable = false)
    private Long taille;

    @Column(name = "date_upload", nullable = false)
    private LocalDateTime dateUpload;

    @Column(name = "uploade_par", nullable = false)
    private String uploadePar;

    /** UPLOADING → TRAITEMENT → PRET | ERREUR */
    @Column(nullable = false)
    private String statut;

    @Column(columnDefinition = "TEXT")
    private String erreur;
}
