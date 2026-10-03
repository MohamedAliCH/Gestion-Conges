package com.backend.intraspace.services.Impl;

import com.backend.intraspace.dtos.ChangePasswordRequestDto;
import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.mappers.EmployesMapper;
import com.backend.intraspace.repositories.CongeRepository;
import com.backend.intraspace.repositories.EmployeRepository;
import com.backend.intraspace.services.EmailService;
import com.backend.intraspace.services.EmployesService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployesServiceImpl implements EmployesService {

    private static final String PASSWORD_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int PASSWORD_LENGTH = 12;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final EmployeRepository employeRepository;
    private final CongeRepository congeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployesMapper employesMapper;
    private final EmailService emailService;

    public EmployeResponseDto createEmploye(EmployeRequestDto employeRequestDto){
        if(employeRepository.existsByEmail(employeRequestDto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        if(employeRepository.existsByCin(employeRequestDto.getCin())) {
            throw new RuntimeException("CIN déjà utilisé");
        }

        Employe employe = employesMapper.toEntity(employeRequestDto);
        
        // Generate a strong random password using SecureRandom
        String generatedPassword = generateSecurePassword();
        employe.setPassword(passwordEncoder.encode(generatedPassword));
        employe.setCreatedAt(LocalDate.now());
        employe.setActive(true);
        employe.setFirstLogin(true);

        LocalDate hireDate = employeRequestDto.getDateEmbauche() != null
                ? employeRequestDto.getDateEmbauche()
                : LocalDate.now();
        employe.setDateEmbauche(hireDate);
        long monthsWorked = ChronoUnit.MONTHS.between(hireDate, LocalDate.now());
        employe.setSoldeAnnuel((int) monthsWorked * 2);
        employeRepository.save(employe);
        
        // Envoyer le vrai email
        emailService.sendTempPasswordEmail(employe.getEmail(), generatedPassword);
        
        EmployeResponseDto employeResponseDto=employesMapper.toDto(employe);
        employeResponseDto.setGeneratedPassword(generatedPassword);
        return employeResponseDto;
    }

    private String generateSecurePassword() {
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARS.charAt(SECURE_RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    public List<EmployeResponseDto> getAllEmployes(){
        List<Employe> employes=employeRepository.findAll();
        return employes.stream()
                .map(employesMapper::toDto)
                .toList();

    }

    public EmployeResponseDto getEmployeById(Long id){
        Employe employe=employeRepository.findById(id)
                .orElseThrow(()->new RuntimeException("employe not found"));
        return employesMapper.toDto(employe);
    }

    public EmployeResponseDto updateEmploye(Long id, EmployeRequestDto employeRequestDto){
        Employe employeExistant=employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        employeExistant.setNom(employeRequestDto.getNom());
        employeExistant.setPrenom(employeRequestDto.getPrenom());
        employeExistant.setEmail(employeRequestDto.getEmail());
        employeExistant.setRole(employeRequestDto.getRole());
        employeExistant.setPhone(employeRequestDto.getPhone());
        employeExistant.setAddress(employeRequestDto.getAddress());
        if (employeRequestDto.getDateEmbauche() != null) {
            LocalDate newHireDate = employeRequestDto.getDateEmbauche();
            employeExistant.setDateEmbauche(newHireDate);
            long months = ChronoUnit.MONTHS.between(newHireDate, LocalDate.now());
            int totalAcquired = (int) months * 2;
            int usedDays = congeRepository.sumApprovedDaysByTypeAndEmploye(employeExistant.getId(), "Congé Annuel");
            employeExistant.setSoldeAnnuel(Math.max(0, totalAcquired - usedDays));
        }
        if (employeRequestDto.getSalaire() != null) {
            employeExistant.setSalaire(employeRequestDto.getSalaire());
        }
        if (employeRequestDto.getDepartement() != null) {
            employeExistant.setDepartement(employeRequestDto.getDepartement());
        }
        employeRepository.save(employeExistant);
        return employesMapper.toDto(employeExistant);

    }

    public void desactivateEmploye(Long id){
        Employe employe=employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        employe.setActive(!employe.isActive());
        employeRepository.save(employe);
    }


    public void changePassword(String email, ChangePasswordRequestDto requestDto){
        Employe employe=employeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("employe not found"));

        if(!passwordEncoder.matches(requestDto.getOldPassword(),employe.getPassword())){
            throw new RuntimeException("passwords dont match");
        }
        employe.setPassword(passwordEncoder.encode(requestDto.getNewPassword()));
        employe.setFirstLogin(false);
        employeRepository.save(employe);
    }

}
