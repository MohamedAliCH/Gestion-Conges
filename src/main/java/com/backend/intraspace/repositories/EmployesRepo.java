package com.backend.intraspace.repositories;

import com.backend.intraspace.entities.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployesRepo extends JpaRepository<Employee, Long> {

    boolean existsByEmail(String email);

    boolean existsByCin(String cin);

    Optional<Employee> findByCin(String cin);

    Optional<Employee> findByEmail(String email);

    List<Employee> findByActifTrue();
}
