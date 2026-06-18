package com.backend.intraspace.dtos;

import com.backend.intraspace.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {
    private String token;
    private String email;
    private Role role;
    private boolean firstLogin;
}
