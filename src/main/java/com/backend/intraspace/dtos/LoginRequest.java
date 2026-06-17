package com.backend.intraspace.dtos;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String motDePasse;
}
