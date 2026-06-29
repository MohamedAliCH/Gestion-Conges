package com.backend.intraspace.mappers;

import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;
import com.backend.intraspace.entities.Employe;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployesMapper {

    // 1. DTO -> Entité
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "firstLogin", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "tempPassword", ignore = true)
    @Mapping(target = "soldeAnnuel", ignore = true)
    @Mapping(target = "soldeMaladie", ignore = true)
    @Mapping(target = "dateEmbauche", source = "dateEmbauche")
    @Mapping(target = "salaire", source = "salaire")
    @Mapping(target = "departement", source = "departement")
    @Mapping(target = "poste", source = "poste")
    Employe toEntity(EmployeRequestDto dto);

    @Mapping(target = "generatedPassword", ignore = true)
    EmployeResponseDto toDto(Employe employe);
}

