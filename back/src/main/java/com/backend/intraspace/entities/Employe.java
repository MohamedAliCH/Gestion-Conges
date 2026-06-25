package com.backend.intraspace.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "employes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String cin;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;


    // --- Champs rajoutés pour le fonctionnement RH ---

    private boolean isActive = true;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "date_embauche")
    private LocalDate dateEmbauche;

    @Column(name = "first_login", nullable = false)
    private boolean firstLogin=true;

    private String phone;
    private String address;

    @Column(name = "temp_password")
    private String tempPassword;

    @Column(name = "solde_annuel")
    private int soldeAnnuel = 0;

    @Column(name = "solde_maladie")
    private int soldeMaladie = 8;
}
