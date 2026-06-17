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
    Employe toEntity(EmployeRequestDto dto);

    EmployeResponseDto toDto(Employe employe);


}
