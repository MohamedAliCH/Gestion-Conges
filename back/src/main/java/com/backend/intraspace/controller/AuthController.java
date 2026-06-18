package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.AuthRequestDto;
import com.backend.intraspace.dtos.AuthResponseDto;
import com.backend.intraspace.dtos.ChangePasswordRequestDto;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.repositories.EmployeRepository;
import com.backend.intraspace.security.JwtService;
import com.backend.intraspace.services.EmployesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.intraspace.dtos.LoginRequest;
import com.backend.intraspace.dtos.LoginResponse;
import com.backend.intraspace.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


@CrossOrigin("*")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final EmployeRepository employeRepository;
    private final EmployesService employesService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody AuthRequestDto authRequestDto) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequestDto.getEmail(), authRequestDto.getPassword())
        );
        Employe employe=employeRepository.findByEmail(authRequestDto.getEmail())
                .orElseThrow(()->new RuntimeException("employe not found"));

        UserDetails userDetails =userDetailsService.loadUserByUsername(employe.getEmail());
        String token =jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponseDto(token,
                employe.getEmail(),
                employe.getRole(),
                employe.isFirstLogin()
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequestDto changePasswordRequestDto, Principal principal) throws Exception {
        String email=principal.getName();
        employesService.changePassword(email,changePasswordRequestDto);
        return ResponseEntity.ok("Mot de passe change");
    }
}
