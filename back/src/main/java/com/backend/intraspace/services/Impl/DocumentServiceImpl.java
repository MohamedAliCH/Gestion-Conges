package com.backend.intraspace.services.Impl;

import com.backend.intraspace.dtos.DocumentUploadResponseDto;
import com.backend.intraspace.entities.Document;
import com.backend.intraspace.repositories.DocumentRepository;
import com.backend.intraspace.services.DocumentIndexingService;
import com.backend.intraspace.services.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentServiceImpl implements DocumentService {

    private static final Set<String> ALLOWED_MIME = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
    );
    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB

    private final DocumentRepository documentRepository;
    private final DocumentIndexingService documentIndexingService;

    @Value("${app.upload.dir:uploads/hr-documents}")
    private String uploadDir;

    private final Tika tika = new Tika();

    @Override
    public DocumentUploadResponseDto upload(MultipartFile file, Principal principal) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Fichier vide ou manquant.");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("Fichier trop volumineux — maximum 10 MB.");
        }

        // Content-based MIME detection via Tika
        String mimeType;
        try {
            mimeType = tika.detect(file.getInputStream(), file.getOriginalFilename());
        } catch (IOException e) {
            throw new RuntimeException("Impossible de détecter le type du fichier.");
        }
        if (!ALLOWED_MIME.contains(mimeType)) {
            throw new RuntimeException("Type de fichier non autorisé — PDF ou DOCX uniquement. Détecté : " + mimeType);
        }

        // Unique filename: timestamp_originalName
        String originalName = sanitize(file.getOriginalFilename());
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String storedName = timestamp + "_" + originalName;

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire d'upload.");
        }

        Path destination = uploadPath.resolve(storedName);
        try {
            file.transferTo(destination.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier.");
        }

        // Persist metadata using colleague's Document entity
        Document doc = new Document();
        doc.setFileName(originalName);
        doc.setFileType(mimeType);
        doc.setUploadDate(LocalDate.now());
        doc.setFilePath(destination.toString());
        doc.setStatus("PROCESSING");
        doc.setAccessRole("ROLE_ADMIN");
        doc.setUploadedBy(principal.getName());
        doc = documentRepository.save(doc);

        // Trigger async RAG indexing pipeline
        documentIndexingService.index(doc.getId(), destination.toString(), doc.getAccessRole());
        log.info("Document '{}' uploadé — pipeline RAG déclenché.", originalName);

        DocumentUploadResponseDto dto = toDto(doc);
        dto.setMessage("Document uploadé. Pipeline RAG en cours...");
        return dto;
    }

    @Override
    public List<DocumentUploadResponseDto> getAll() {
        return documentRepository.findAll().stream()
                .sorted(Comparator.comparing(Document::getUploadDate, Comparator.reverseOrder()))
                .map(this::toDto)
                .toList();
    }

    private DocumentUploadResponseDto toDto(Document doc) {
        return new DocumentUploadResponseDto(
                doc.getId(), doc.getFileName(), doc.getFileType(),
                doc.getUploadDate(), doc.getStatus(), doc.getAccessRole(),
                doc.getUploadedBy(), null
        );
    }

    private String sanitize(String filename) {
        if (filename == null) return "document";
        return filename.replaceAll("[^a-zA-Z0-9._\\-]", "_");
    }
}
