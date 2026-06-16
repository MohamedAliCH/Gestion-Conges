package com.backend.intraspace.dtos;

import com.backend.intraspace.entities.Role;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class EmployeRequestDto {
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private Role role;
    
}
