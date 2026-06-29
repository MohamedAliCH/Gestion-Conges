package com.backend.intraspace.services.Impl;

import com.backend.intraspace.dtos.DocumentUploadResponseDto;
import com.backend.intraspace.entities.DocumentRH;
import com.backend.intraspace.repositories.DocumentChunkRepository;
import com.backend.intraspace.repositories.DocumentRHRepository;
import com.backend.intraspace.services.DocumentService;
import com.backend.intraspace.services.RagPipelineService;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    private final DocumentRHRepository documentRHRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final RagPipelineService ragPipelineService;

    @Value("${app.upload.dir:uploads/hr-documents}")
    private String uploadDir;

    private final Tika tika = new Tika();

    @Override
    public DocumentUploadResponseDto upload(MultipartFile file, Principal principal) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Fichier vide ou manquant.");
        }

        // Size validation
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("Fichier trop volumineux — maximum 10 MB.");
        }

        // MIME type validation via Tika (content-based, not just extension)
        String mimeType;
        try {
            mimeType = tika.detect(file.getInputStream(), file.getOriginalFilename());
        } catch (IOException e) {
            throw new RuntimeException("Impossible de détecter le type du fichier.");
        }
        if (!ALLOWED_MIME.contains(mimeType)) {
            throw new RuntimeException("Type de fichier non autorisé — PDF ou DOCX uniquement. Détecté : " + mimeType);
        }

        // Build unique filename: timestamp_originalName
        String originalName = sanitize(file.getOriginalFilename());
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String storedName = timestamp + "_" + originalName;

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire d'upload.");
        }

        // Save file to disk
        Path destination = uploadPath.resolve(storedName);
        try {
            file.transferTo(destination.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier.");
        }

        // Persist metadata
        DocumentRH doc = new DocumentRH();
        doc.setNom(originalName);
        doc.setCheminFichier(destination.toString());
        doc.setTypeMime(mimeType);
        doc.setTaille(file.getSize());
        doc.setDateUpload(LocalDateTime.now());
        doc.setUploadePar(principal.getName());
        doc.setStatut("UPLOADING");
        doc = documentRHRepository.save(doc);

        // Trigger async RAG pipeline
        ragPipelineService.process(doc.getId(), destination.toString());

        log.info("Document '{}' uploadé par {} — RAG pipeline déclenché.", originalName, principal.getName());

        DocumentUploadResponseDto dto = toDto(doc);
        dto.setMessage("Document uploadé. Pipeline RAG en cours...");
        return dto;
    }

    @Override
    public List<DocumentUploadResponseDto> getAll() {
        return documentRHRepository.findAllByOrderByDateUploadDesc()
                .stream().map(this::toDto).toList();
    }

    private DocumentUploadResponseDto toDto(DocumentRH doc) {
        return new DocumentUploadResponseDto(
                doc.getId(), doc.getNom(), doc.getTypeMime(),
                doc.getTaille(), doc.getDateUpload(),
                doc.getUploadePar(), doc.getStatut(), null
        );
    }

    private String sanitize(String filename) {
        if (filename == null) return "document";
        return filename.replaceAll("[^a-zA-Z0-9._\\-]", "_");
    }
}
