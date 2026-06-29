package com.backend.intraspace.services;

public interface DocumentIndexingService {
    void index(Long documentId, String filePath, String accessRole);
}
