package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.PayslipDto;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.repositories.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/employe/fiche-paie")
@RequiredArgsConstructor
public class PayslipController {

    private static final int MONTHS_SHOWN = 6;
    private static final DateTimeFormatter PERIOD_FMT =
            DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH);

    private final EmployeRepository employeRepository;

    @GetMapping
    public ResponseEntity<List<PayslipDto>> getPayslips(Principal principal) {
        Employe employe = employeRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        BigDecimal brut = employe.getSalaire();
        if (brut == null || brut.compareTo(BigDecimal.ZERO) == 0) {
            return ResponseEntity.ok(List.of());
        }

        String dateEmbauche = employe.getDateEmbauche() != null
                ? employe.getDateEmbauche().toString() : "";

        List<PayslipDto> payslips = new ArrayList<>();
        LocalDate cursor = LocalDate.now().withDayOfMonth(1);

        String cin    = employe.getCin() != null ? employe.getCin() : "—";
        String phone  = employe.getPhone() != null ? employe.getPhone() : "—";
        String dept   = employe.getDepartement() != null ? employe.getDepartement() : "—";
        String poste  = employe.getRole() != null ? formatRole(employe.getRole().name()) : "—";

        for (int i = 0; i < MONTHS_SHOWN; i++) {
            String period = capitalize(cursor.format(PERIOD_FMT));
            payslips.add(PayslipDto.of(
                    employe.getPrenom(), employe.getNom(), employe.getEmail(),
                    cin, phone, dept, poste, dateEmbauche,
                    brut,
                    cursor.getMonthValue(), cursor.getYear(),
                    period));
            cursor = cursor.minusMonths(1);
        }

        return ResponseEntity.ok(payslips);
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private String formatRole(String role) {
        return switch (role) {
            case "ROLE_ADMIN"   -> "Administrateur RH";
            case "ROLE_EMPLOYE" -> "Employé";
            default             -> role;
        };
    }
}
