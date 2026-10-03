package com.backend.intraspace.config;

import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.repositories.EmployeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeaveScheduler {

    private final EmployeRepository employeRepository;

    // Runs at midnight every day; credits +2 only on the last day of the month
    @Scheduled(cron = "0 0 0 * * *")
    public void creditMonthlyAnnualLeave() {
        LocalDate today = LocalDate.now();
        if (!today.equals(today.with(TemporalAdjusters.lastDayOfMonth()))) return;

        List<Employe> actifs = employeRepository.findAll().stream()
                .filter(e -> e.isActive())
                .toList();

        for (Employe employe : actifs) {
            employe.setSoldeAnnuel(employe.getSoldeAnnuel() + 2);
        }
        employeRepository.saveAll(actifs);
        log.info("[Scheduler] Solde annuel incrémenté de 2 pour {} employé(s) actif(s) — {}", actifs.size(), today);
    }
}
