package com.backend.intraspace.services.Impl;

import com.backend.intraspace.dtos.CongeRequestDto;
import com.backend.intraspace.dtos.CongeResponseDto;
import com.backend.intraspace.entities.Conge;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.mappers.CongeMapper;
import com.backend.intraspace.repositories.CongeRepository;
import com.backend.intraspace.repositories.EmployeRepository;
import com.backend.intraspace.services.CongeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.backend.intraspace.dtos.SoldeCongeDto;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CongeServiceImpl implements CongeService {

    private final CongeRepository congeRepository;
    private final EmployeRepository employeRepository;
    private final CongeMapper congeMapper;

    @Override
    public CongeResponseDto requestLeave(CongeRequestDto requestDto, String email) {
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        if (requestDto.getTo().isBefore(requestDto.getFrom())) {
            throw new RuntimeException("La date de fin doit être après ou égale à la date de début.");
        }
        if (!requestDto.getFrom().isAfter(LocalDate.now())) {
            throw new RuntimeException("La date de début doit être après la date d'aujourd'hui.");
        }

        Conge conge = congeMapper.toEntity(requestDto);
        conge.setEmploye(employe);

        long diffDays = ChronoUnit.DAYS.between(requestDto.getFrom(), requestDto.getTo()) + 1;
        int days = (int) diffDays;
        conge.setDays(days);

        // Capacity check: at most 2 approved employees on any single day of the range
        List<Conge> overlapping = congeRepository.findApprovedOverlapping(
                requestDto.getFrom(), requestDto.getTo(), employe.getId());
        for (LocalDate day = requestDto.getFrom(); !day.isAfter(requestDto.getTo()); day = day.plusDays(1)) {
            final LocalDate d = day;
            long count = overlapping.stream()
                    .filter(c -> !c.getDateDebut().isAfter(d) && !c.getDateFin().isBefore(d))
                    .count();
            if (count >= 2) {
                conge.setStatus("Refusé");
                conge.setRefusMotif("Capacité maximale atteinte — 2 employés déjà approuvés le " + d);
                return mapToDtoWithColor(congeRepository.save(conge));
            }
        }

        String type = requestDto.getType();
        if ("Congé Annuel".equals(type)) {
            if (employe.getSoldeAnnuel() < days) {
                conge.setStatus("Refusé");
                conge.setRefusMotif("Solde insuffisant — " + employe.getSoldeAnnuel() + " jour(s) disponible(s)");
                Conge savedConge = congeRepository.save(conge);
                return mapToDtoWithColor(savedConge);
            }
            employe.setSoldeAnnuel(employe.getSoldeAnnuel() - days);
            employeRepository.save(employe);
        } else if ("Congé Maladie".equals(type)) {
            if (employe.getSoldeMaladie() < days) {
                conge.setStatus("Refusé");
                conge.setRefusMotif("Solde insuffisant — " + employe.getSoldeMaladie() + " jour(s) disponible(s)");
                Conge savedConge = congeRepository.save(conge);
                return mapToDtoWithColor(savedConge);
            }
            employe.setSoldeMaladie(employe.getSoldeMaladie() - days);
            employeRepository.save(employe);
        }

        conge.setStatus("En attente");
        Conge savedConge = congeRepository.save(conge);
        return mapToDtoWithColor(savedConge);
    }

    @Override
    public List<CongeResponseDto> getMyLeaves(String email) {
        List<Conge> conges = congeRepository.findByEmployeEmailOrderByDateDebutDesc(email);
        return conges.stream()
                .map(this::mapToDtoWithColor)
                .toList();
    }

    @Override
    public void cancelLeave(Long id, String email) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));

        if (!conge.getEmploye().getEmail().equals(email)) {
            throw new RuntimeException("Non autorisé à annuler cette demande.");
        }

        if (!"En attente".equals(conge.getStatus())) {
            throw new RuntimeException("Seules les demandes en attente peuvent être annulées.");
        }

        refundCredits(conge);
        congeRepository.delete(conge);
    }

    private CongeResponseDto mapToDtoWithColor(Conge conge) {
        CongeResponseDto dto = congeMapper.toDto(conge);
        String color = "warning";
        if ("Approuvé".equalsIgnoreCase(conge.getStatus())) {
            color = "success";
        } else if ("Refusé".equalsIgnoreCase(conge.getStatus()) || "Annulé".equalsIgnoreCase(conge.getStatus())) {
            color = "danger";
        }
        dto.setStatusColor(color);
        return dto;
    }

    @Override
    public List<CongeResponseDto> getAllLeaves() {
        return congeRepository.findAllByOrderByDateDebutDesc().stream()
                .map(this::mapToDtoWithColor)
                .toList();
    }

    @Override
    public List<CongeResponseDto> getPendingLeaves() {
        return congeRepository.findByStatusOrderByDateDebutDesc("En attente").stream()
                .map(this::mapToDtoWithColor)
                .toList();
    }

    @Override
    public CongeResponseDto approveLeave(Long id) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));
        conge.setStatus("Approuvé");
        conge.setRefusMotif(null);
        Conge savedConge = congeRepository.save(conge);
        return mapToDtoWithColor(savedConge);
    }

    @Override
    public CongeResponseDto rejectLeave(Long id, String reason) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));
        refundCredits(conge);
        conge.setStatus("Refusé");
        conge.setRefusMotif(reason);
        Conge savedConge = congeRepository.save(conge);
        return mapToDtoWithColor(savedConge);
    }

    private void refundCredits(Conge conge) {
        if (!"En attente".equals(conge.getStatus())) return;
        Employe employe = conge.getEmploye();
        if ("Congé Annuel".equals(conge.getType())) {
            employe.setSoldeAnnuel(employe.getSoldeAnnuel() + conge.getDays());
            employeRepository.save(employe);
        } else if ("Congé Maladie".equals(conge.getType())) {
            employe.setSoldeMaladie(employe.getSoldeMaladie() + conge.getDays());
            employeRepository.save(employe);
        }
    }

    @Override
    public SoldeCongeDto getSolde(String email) {
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        List<Conge> conges = congeRepository.findByEmployeEmailOrderByDateDebutDesc(email);

        // --- Congé Annuel ---
        int restantAnnuel = employe.getSoldeAnnuel();
        int utilisesAnnuel = conges.stream()
                .filter(c -> "Congé Annuel".equals(c.getType()) && "Approuvé".equals(c.getStatus()))
                .mapToInt(c -> c.getDays())
                .sum();
        int enCoursAnnuel = conges.stream()
                .filter(c -> "Congé Annuel".equals(c.getType()) && "En attente".equals(c.getStatus()))
                .mapToInt(c -> c.getDays())
                .sum();
        int acquisAnnuel = restantAnnuel + utilisesAnnuel + enCoursAnnuel;

        // --- Congé Maladie ---
        int restantMaladie = employe.getSoldeMaladie();
        int utilisesMaladie = conges.stream()
                .filter(c -> "Congé Maladie".equals(c.getType()) && "Approuvé".equals(c.getStatus()))
                .mapToInt(c -> c.getDays())
                .sum();
        int enCoursMaladie = conges.stream()
                .filter(c -> "Congé Maladie".equals(c.getType()) && "En attente".equals(c.getStatus()))
                .mapToInt(c -> c.getDays())
                .sum();
        int acquisMaladie = restantMaladie + utilisesMaladie + enCoursMaladie;

        // --- Congé Sans Solde ---
        int utilisesSansSolde = conges.stream()
                .filter(c -> "Congé Sans Solde".equals(c.getType()) && "Approuvé".equals(c.getStatus()))
                .mapToInt(c -> c.getDays())
                .sum();
        int enCoursSansSolde = conges.stream()
                .filter(c -> "Congé Sans Solde".equals(c.getType()) && "En attente".equals(c.getStatus()))
                .mapToInt(c -> c.getDays())
                .sum();

        // --- Totaux ---
        int totalAcquis = acquisAnnuel + acquisMaladie;
        int totalUtilises = utilisesAnnuel + utilisesMaladie;
        int enCours = enCoursAnnuel + enCoursMaladie + enCoursSansSolde;
        int soldeGlobal = restantAnnuel + restantMaladie;

        // Construction des détails par type
        List<SoldeCongeDto.SoldeParType> details = new ArrayList<>();
        details.add(new SoldeCongeDto.SoldeParType("Congé Annuel", acquisAnnuel, utilisesAnnuel, restantAnnuel));
        details.add(new SoldeCongeDto.SoldeParType("Congé Maladie", acquisMaladie, utilisesMaladie, restantMaladie));
        details.add(new SoldeCongeDto.SoldeParType("Congé Sans Solde", 0, utilisesSansSolde, 0));

        return new SoldeCongeDto(soldeGlobal, totalAcquis, totalUtilises, enCours, details);
    }

}

