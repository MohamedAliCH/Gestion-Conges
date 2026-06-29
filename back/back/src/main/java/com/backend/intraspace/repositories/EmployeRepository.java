package com.backend.intraspace.repositories;

import com.backend.intraspace.entities.Employe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeRepository extends JpaRepository<Employe, Long> {
    Optional<Employe> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCin(String cin);
}
