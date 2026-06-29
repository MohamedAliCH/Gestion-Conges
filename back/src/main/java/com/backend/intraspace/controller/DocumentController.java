package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.DocumentUploadResponseDto;
import com.backend.intraspace.services.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentUploadResponseDto> upload(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(documentService.upload(file, principal));
    }

    @GetMapping
    public ResponseEntity<List<DocumentUploadResponseDto>> list() {
        return ResponseEntity.ok(documentService.getAll());
    }
}
