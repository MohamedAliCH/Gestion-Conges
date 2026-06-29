package com.backend.intraspace.repositories;

import com.backend.intraspace.entities.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    List<DocumentChunk> findByDocumentIdOrderByChunkIndex(Long documentId);
    void deleteByDocumentId(Long documentId);
}
