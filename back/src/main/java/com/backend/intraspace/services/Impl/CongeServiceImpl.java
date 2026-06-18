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

import java.time.temporal.ChronoUnit;
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

        Conge conge = congeMapper.toEntity(requestDto);
        conge.setEmploye(employe);

        long diffDays = ChronoUnit.DAYS.between(requestDto.getFrom(), requestDto.getTo()) + 1;
        conge.setDays((int) diffDays);
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

        congeRepository.delete(conge);
    }

    private CongeResponseDto mapToDtoWithColor(Conge conge) {
        CongeResponseDto dto = congeMapper.toDto(conge);
        String color = "warning";
        if ("Approuvé".equalsIgnoreCase(conge.getStatus())) {
            color = "success";
        } else if ("Rejeté".equalsIgnoreCase(conge.getStatus()) || "Annulé".equalsIgnoreCase(conge.getStatus())) {
            color = "danger";
        }
        dto.setStatusColor(color);
        return dto;
    }
}
