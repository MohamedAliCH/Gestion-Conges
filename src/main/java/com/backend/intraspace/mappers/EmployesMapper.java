package com.backend.intraspace.mappers;

import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;
import com.backend.intraspace.entities.Employe;

public class EmployesMapper {

    public static Employe toEntity(EmployeRequestDto dto){
        if (dto == null) return null;
        Employe employe = new Employe();
        employe.setNom(dto.getNom());
        employe.setPrenom(dto.getPrenom());
        employe.setEmail(dto.getEmail());
        employe.setRole(dto.getRole());

        return employe;
    }

    public static EmployeResponseDto toDto(Employe employe){
        if (employe == null) return null;
        EmployeResponseDto employeResponseDto = new EmployeResponseDto();
        employeResponseDto.setId(employe.getId());
        employeResponseDto.setNom(employe.getNom());
        employeResponseDto.setPrenom(employe.getPrenom());
        employeResponseDto.setEmail(employe.getEmail());
        employeResponseDto.setRole(employe.getRole());
        employeResponseDto.setActive(employe.isActive());
        employeResponseDto.setCreatedAt(employe.getCreatedAt());
        employeResponseDto.setFirstLogin(employe.isFirstLogin());
        return employeResponseDto;
    }


}
