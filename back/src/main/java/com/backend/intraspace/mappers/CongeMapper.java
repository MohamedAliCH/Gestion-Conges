package com.backend.intraspace.mappers;

import com.backend.intraspace.dtos.CongeRequestDto;
import com.backend.intraspace.dtos.CongeResponseDto;
import com.backend.intraspace.entities.Conge;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CongeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "employe", ignore = true)
    @Mapping(target = "days", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "dateDebut", source = "from")
    @Mapping(target = "dateFin", source = "to")
    Conge toEntity(CongeRequestDto dto);

    @Mapping(source = "dateDebut", target = "from", dateFormat = "yyyy-MM-dd")
    @Mapping(source = "dateFin", target = "to", dateFormat = "yyyy-MM-dd")
    @Mapping(target = "statusColor", ignore = true) // Will be mapped programmatically or computed
    CongeResponseDto toDto(Conge conge);
}
