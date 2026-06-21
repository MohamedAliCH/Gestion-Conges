package com.backend.intraspace.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CongeResponseDto {
    private Long id;
    private String type;
    private String from; // formatted date string YYYY-MM-DD
    private String to;   // formatted date string YYYY-MM-DD
    private Integer days;
    private String status;
    private String statusColor;
    private String reason;
    private String refusMotif;
    private String employeNom;
    private Long employeId;
}

