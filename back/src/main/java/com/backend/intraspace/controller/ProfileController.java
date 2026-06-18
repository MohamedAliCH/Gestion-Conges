package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.mappers.EmployesMapper;
import com.backend.intraspace.repositories.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/employee/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final EmployeRepository employeRepository;
    private final EmployesMapper employesMapper;

    @GetMapping
    public ResponseEntity<EmployeResponseDto> getProfile(Principal principal) {
        String email = principal.getName();
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        return ResponseEntity.ok(employesMapper.toDto(employe));
    }

    @PutMapping
    public ResponseEntity<EmployeResponseDto> updateProfile(@RequestBody EmployeRequestDto requestDto, Principal principal) {
        String email = principal.getName();
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        employe.setNom(requestDto.getNom());
        employe.setPrenom(requestDto.getPrenom());
        employe.setPhone(requestDto.getPhone());
        employe.setAddress(requestDto.getAddress());

        employeRepository.save(employe);
        return ResponseEntity.ok(employesMapper.toDto(employe));
    }
}
