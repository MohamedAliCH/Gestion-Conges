package com.backend.intraspace.controller;


import com.backend.intraspace.entities.Document;
import com.backend.intraspace.repositories.DocumentRepository;
import org.springframework.core.io.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/admin/documents")
@RequiredArgsConstructor

public class AdminDocumentController {

    private final DocumentRepository documentRepository;
    private final JdbcTemplate jdbcTemplate;

    // 1. GET /api/admin/documents — Lister tous les documents
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentRepository.findAll());
    }

    // 2. GET /api/admin/documents/{id}/preview — Aperçu du fichier physique
    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewDocument(@PathVariable Long id){
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        try{
            Path filepath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filepath.toUri());
            if (!resource.exists()||!resource.isReadable()){
                throw new RuntimeException("Fichier introuvable ou illisible.");
            }
            String contentType = Files.probeContentType(filepath);
            if (contentType == null){
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + "\"")
                    .body(resource);
        }catch(IOException e){
            return ResponseEntity.internalServerError().build();
        }

    }

    // 3. DELETE /api/admin/documents/{id} — Suppression cascade
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id){
        Document document=documentRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Document non trouvable"));

        // A. Supprimer de pgvector (table vector_store)
        String deleteChunksSql="DELETE FROM vector_store WHERE metadata->>'doc_id' = ?";
        jdbcTemplate.update(deleteChunksSql, String.valueOf(id));

        // B. Supprimer le fichier physique sur le disque
       try {
           Files.deleteIfExists(Paths.get(document.getFilePath()));
       } catch (IOException e) {
           e.printStackTrace();
       }
       documentRepository.delete(document);
       return ResponseEntity.noContent().build();
    }

}
