package com.backend.intraspace.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentUploadResponseDto {
    private Long id;
    private String fileName;
    private String fileType;
    private LocalDate uploadDate;
    private String status;
    private String accessRole;
    private String uploadedBy;
    private String message;
}
