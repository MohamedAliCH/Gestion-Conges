package com.backend.intraspace.config;

import com.backend.intraspace.entities.Employee;
import com.backend.intraspace.entities.Role;
import com.backend.intraspace.repositories.EmployesRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EmployesRepo employesRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(EmployesRepo employesRepo, PasswordEncoder passwordEncoder) {
        this.employesRepo    = employesRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!employesRepo.existsByEmail("admin@devora.tn")) {
            Employee admin = new Employee();
            admin.setNom("Admin");
            admin.setPrenom("RH");
            admin.setEmail("admin@devora.tn");
            admin.setCin("00000000");
            admin.setMotDePasse(passwordEncoder.encode("Admin@1234"));
            admin.setRole(Role.ADMIN);
            admin.setActif(true);
            admin.setDateCreation(LocalDate.now());
            admin.setPoste("Administrateur RH");
            employesRepo.save(admin);
            System.out.println("✅ Compte admin créé : admin@devora.tn");
        } else {
            System.out.println("ℹ️  Compte admin déjà existant, pas de recréation.");
        }
    }
}
