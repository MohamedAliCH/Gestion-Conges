package com.backend.intraspace.services.Impl;

import com.backend.intraspace.dtos.ChangePasswordRequestDto;
import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.mappers.EmployesMapper;
import com.backend.intraspace.repositories.EmployeRepository;
import com.backend.intraspace.dtos.CreateEmployeeRequest;
import com.backend.intraspace.dtos.EmployeeResponse;
import com.backend.intraspace.entities.Employee;
import com.backend.intraspace.repositories.EmployesRepo;
import com.backend.intraspace.services.EmployesService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.backend.intraspace.services.NotificationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmployesServiceImpl implements EmployesService {

    private final EmployeRepository employeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployesMapper employesMapper;

    public EmployeResponseDto createEmploye(EmployeRequestDto employeRequestDto){
        Employe  employe = employesMapper.toEntity(employeRequestDto);
        employe.setPassword(passwordEncoder.encode(employeRequestDto.getPassword()));
        employe.setCreatedAt(LocalDate.now());
        employe.setActive(true);
        employe.setFirstLogin(true);
        employeRepository.save(employe);
        EmployeResponseDto employeResponseDto=employesMapper.toDto(employe);
        return employeResponseDto;
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
        employeRepository.save(employeExistant);
        return employesMapper.toDto(employeExistant);

    }

    public void desactivateEmploye(Long id){
        Employe employe=employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        employe.setActive(false);
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







    private final EmployesRepo employesRepo;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public EmployesServiceImpl(EmployesRepo employesRepo,
                               PasswordEncoder passwordEncoder,
                               NotificationService notificationService) {
        this.employesRepo        = employesRepo;
        this.passwordEncoder     = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Override
    public EmployeeResponse creerEmploye(CreateEmployeeRequest req) {

        // check if CIN already exists
        if (employesRepo.existsByCin(req.getCin())) {
            throw new RuntimeException("Un compte existe déjà pour le CIN : " + req.getCin());
        }

        // check if email already exists
        if (employesRepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // generate a temp password before hashing so we can send the plain version by email
        String motDePasseTemporaire = genererMotDePasse();

        Employee nouveauEmploye = new Employee();
        nouveauEmploye.setCin(req.getCin());
        nouveauEmploye.setNom(req.getNom());
        nouveauEmploye.setPrenom(req.getPrenom());
        nouveauEmploye.setEmail(req.getEmail());
        nouveauEmploye.setTelephone(req.getTelephone());
        nouveauEmploye.setPoste(req.getPoste());
        nouveauEmploye.setRole(req.getRole());
        nouveauEmploye.setActif(true);
        nouveauEmploye.setDateCreation(LocalDate.now());
        // we hash the password before saving — never store plain text in the database
        nouveauEmploye.setMotDePasse(passwordEncoder.encode(motDePasseTemporaire));

        Employee employSauvegarde = employesRepo.save(nouveauEmploye);

        // send login credentials by email after the save succeeds
        notificationService.envoyerIdentifiants(employSauvegarde, motDePasseTemporaire);

        // return EmployeeResponse (no password inside) instead of the full Employee object
        return EmployeeResponse.from(employSauvegarde);
    }

    @Override
    public List<EmployeeResponse> listerTous() {
        List<Employee> tousLesEmployes = employesRepo.findAll();
        List<EmployeeResponse> listeResultat = new ArrayList<>();

        for (Employee employe : tousLesEmployes) {
            listeResultat.add(EmployeeResponse.from(employe));
        }

        return listeResultat;
    }

    // generates a random 10-character password using SecureRandom (safer than regular Random)
    private String genererMotDePasse() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#";
        SecureRandom random = new SecureRandom();
        String motDePasse = "";

        for (int i = 0; i < 10; i++) {
            int index = random.nextInt(characters.length());
            motDePasse = motDePasse + characters.charAt(index);
        }

        return motDePasse;
    }
}
