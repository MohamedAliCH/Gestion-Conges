package com.backend.intraspace.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentUploadResponseDto {
    private Long id;
    private String nom;
    private String typeMime;
    private Long taille;
    private LocalDateTime dateUpload;
    private String uploadePar;
    private String statut;
    private String message;
}
