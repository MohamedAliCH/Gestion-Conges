package com.backend.intraspace.dtos;

import com.backend.intraspace.entities.Role;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class EmployeRequestDto {
    private String nom;
    private String prenom;
    private String email;
    private String cin;
    private Role role;
    private String phone;
    private String address;
    private LocalDate dateEmbauche;
    private BigDecimal salaire;
    private String departement;
}
