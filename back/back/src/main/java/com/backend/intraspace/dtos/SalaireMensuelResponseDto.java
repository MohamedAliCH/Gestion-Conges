package com.backend.intraspace.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalaireMensuelResponseDto {
    private Double salaireBase;
    private int joursSansSolde;
    private Double tauxJournalier;
    private Double deduction;
    private Double salaireNet;
    private int annee;
    private int mois;
}
