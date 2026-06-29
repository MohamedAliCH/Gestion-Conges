package com.backend.intraspace.services;

import com.backend.intraspace.dtos.DocumentUploadResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

public interface DocumentService {
    DocumentUploadResponseDto upload(MultipartFile file, Principal principal);
    List<DocumentUploadResponseDto> getAll();
}
