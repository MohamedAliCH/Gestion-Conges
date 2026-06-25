package com.backend.intraspace.dtos;

import com.backend.intraspace.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class EmployeResponseDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String cin;
    private Role role;
    private boolean isActive;
    private LocalDate createdAt;
    private LocalDate dateEmbauche;
    private boolean firstLogin;
    private String phone;
    private String address;
    private String generatedPassword;
    private String tempPassword;
    private int soldeAnnuel;
    private int soldeMaladie;
}

