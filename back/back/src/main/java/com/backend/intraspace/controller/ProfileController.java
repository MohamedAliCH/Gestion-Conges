package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;
import com.backend.intraspace.dtos.SalaireMensuelResponseDto;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.mappers.EmployesMapper;
import com.backend.intraspace.repositories.CongeRepository;
import com.backend.intraspace.repositories.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@RestController
@RequestMapping("/api/employe/profil")
@RequiredArgsConstructor
public class ProfileController {

    private final EmployeRepository employeRepository;
    private final EmployesMapper employesMapper;
    private final CongeRepository congeRepository;

    @GetMapping
    public ResponseEntity<EmployeResponseDto> getProfile(Principal principal) {
        String email = principal.getName();
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        return ResponseEntity.ok(employesMapper.toDto(employe));
    }

    @GetMapping("/salaire-mensuel")
    public ResponseEntity<SalaireMensuelResponseDto> getSalaireMensuel(Principal principal) {
        String email = principal.getName();
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        double salaireBase = employe.getSalaire() != null ? employe.getSalaire() : 0.0;
        int joursSansSolde = congeRepository.sumCssDaysInMonth(employe.getId(), startOfMonth, endOfMonth);
        double tauxJournalier = salaireBase / 26.0;
        double deduction = joursSansSolde * tauxJournalier;
        double salaireNet = salaireBase - deduction;

        return ResponseEntity.ok(new SalaireMensuelResponseDto(
                salaireBase, joursSansSolde, Math.round(tauxJournalier * 100.0) / 100.0,
                Math.round(deduction * 100.0) / 100.0, Math.round(salaireNet * 100.0) / 100.0,
                today.getYear(), today.getMonthValue()
        ));
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
