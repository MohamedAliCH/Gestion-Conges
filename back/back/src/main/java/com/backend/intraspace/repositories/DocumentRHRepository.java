package com.backend.intraspace.repositories;

import com.backend.intraspace.entities.DocumentRH;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRHRepository extends JpaRepository<DocumentRH, Long> {
    List<DocumentRH> findAllByOrderByDateUploadDesc();
    Optional<DocumentRH> findByNom(String nom);
}
