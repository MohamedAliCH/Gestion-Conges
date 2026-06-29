package com.backend.intraspace.repositories;


import com.backend.intraspace.entities.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface DocumentRepository extends JpaRepository<Document, Long> {


}
