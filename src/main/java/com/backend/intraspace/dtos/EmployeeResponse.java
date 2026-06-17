package com.backend.intraspace.dtos;

import com.backend.intraspace.entities.Employee;
import com.backend.intraspace.entities.Role;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeResponse {

    private Long id;
    private String cin;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String poste;
    private Role role;
    private boolean actif;
    private LocalDate dateCreation;

    public static EmployeeResponse from(Employee emp) {
        EmployeeResponse r = new EmployeeResponse();
        r.id           = emp.getId();
        r.cin          = emp.getCin();
        r.nom          = emp.getNom();
        r.prenom       = emp.getPrenom();
        r.email        = emp.getEmail();
        r.telephone    = emp.getTelephone();
        r.poste        = emp.getPoste();
        r.role         = emp.getRole();
        r.actif        = emp.isActif();
        r.dateCreation = emp.getDateCreation();
        return r;
    }
}
