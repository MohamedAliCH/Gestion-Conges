package com.backend.intraspace.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name="documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "upload_date", nullable = false)
    private LocalDate uploadDate;

    @Column(nullable = false)
    private String status; // INDEXED, ERROR, PROCESSING

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "access_role", nullable = false)
    private String accessRole; // ROLE_ADMIN ou ROLE_EMPLOYE

    @Column(name = "uploaded_by")
    private String uploadedBy;

}
