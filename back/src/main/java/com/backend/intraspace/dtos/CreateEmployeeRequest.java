package com.backend.intraspace.dtos;

import com.backend.intraspace.entities.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateEmployeeRequest {

    @NotBlank(message = "Le CIN est obligatoire")
    @Pattern(regexp = "^[0-9]{8}$", message = "CIN : 8 chiffres exactement")
    private String cin;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @Email(message = "Format email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Numéro de téléphone invalide")
    private String telephone;

    private String poste;

    private Role role = Role.EMPLOYEE;
}
