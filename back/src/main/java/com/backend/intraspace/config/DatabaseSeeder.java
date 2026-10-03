package com.backend.intraspace.config;

import com.backend.intraspace.entities.Conge;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.entities.Role;
import com.backend.intraspace.repositories.CongeRepository;
import com.backend.intraspace.repositories.EmployeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final EmployeRepository employeRepository;
    private final CongeRepository congeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (employeRepository.count() == 0) {
            log.info("--- Seeding default users and leaves ---");

            // 1. Seed Admin
            Employe admin = new Employe();
            admin.setPrenom("Admin");
            admin.setNom("Systeme");
            admin.setEmail("admin@intraspace.com");
            admin.setCin("00000000");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setActive(true);
            admin.setCreatedAt(LocalDate.of(2026, 6, 17));
            admin.setFirstLogin(false);
            employeRepository.save(admin);
            log.info("Admin seeded: admin@intraspace.com");

            // 2. Seed Employee
            Employe employee = new Employe();
            employee.setPrenom("John");
            employee.setNom("Doe");
            employee.setEmail("employe@intraspace.com");
            employee.setCin("11111111");
            employee.setPassword(passwordEncoder.encode("admin123"));
            employee.setRole(Role.ROLE_EMPLOYE);
            employee.setActive(true);
            employee.setCreatedAt(LocalDate.of(2026, 6, 17));
            employee.setFirstLogin(true);
            employee.setPhone("+216 55 123 456");
            employee.setAddress("123 Avenue Habib Bourguiba, Tunis");
            Employe savedEmployee = employeRepository.save(employee);
            log.info("Employee seeded: employe@intraspace.com");

            // 3. Seed Mock Leaves for savedEmployee
            Conge conge1 = new Conge();
            conge1.setEmploye(savedEmployee);
            conge1.setType("Congé Annuel");
            conge1.setDateDebut(LocalDate.of(2026, 4, 1));
            conge1.setDateFin(LocalDate.of(2026, 4, 12));
            conge1.setDays(12);
            conge1.setStatus("Approuvé");
            congeRepository.save(conge1);

            Conge conge2 = new Conge();
            conge2.setEmploye(savedEmployee);
            conge2.setType("Congé Maladie");
            conge2.setDateDebut(LocalDate.of(2026, 5, 1));
            conge2.setDateFin(LocalDate.of(2026, 5, 2));
            conge2.setDays(2);
            conge2.setStatus("Approuvé");
            congeRepository.save(conge2);

            Conge conge3 = new Conge();
            conge3.setEmploye(savedEmployee);
            conge3.setType("Congé Annuel");
            conge3.setDateDebut(LocalDate.of(2026, 6, 20));
            conge3.setDateFin(LocalDate.of(2026, 6, 20));
            conge3.setDays(1);
            conge3.setStatus("En attente");
            congeRepository.save(conge3);

            log.info("Mock leaves seeded for employe@intraspace.com");
            log.info("----------------------------------------");
        }
    }
}
