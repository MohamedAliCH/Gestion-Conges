package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.DocumentUploadResponseDto;
import com.backend.intraspace.services.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * POST /api/documents/upload
     * Accessible uniquement par ROLE_ADMIN (enforced in SecurityConfig).
     * Accepte PDF / DOCX, max 10 MB.
     * Déclenche le pipeline RAG de façon asynchrone après upload.
     */
    @PostMapping("/upload")
    public ResponseEntity<DocumentUploadResponseDto> upload(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        DocumentUploadResponseDto response = documentService.upload(file, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentUploadResponseDto>> list() {
        return ResponseEntity.ok(documentService.getAll());
    }
}
