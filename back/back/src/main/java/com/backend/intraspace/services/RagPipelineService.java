package com.backend.intraspace.services;

public interface RagPipelineService {
    void process(Long documentId, String filePath);
}
