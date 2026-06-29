package com.backend.intraspace.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CongeRequestDto {
    private String type;
    private LocalDate from;
    private LocalDate to;
    private String reason;
}
