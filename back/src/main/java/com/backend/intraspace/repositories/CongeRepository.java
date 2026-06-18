package com.backend.intraspace.repositories;

import com.backend.intraspace.entities.Conge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CongeRepository extends JpaRepository<Conge, Long> {
    List<Conge> findByEmployeEmailOrderByDateDebutDesc(String email);
    List<Conge> findByEmployeIdOrderByDateDebutDesc(Long id);
}
