package com.backend.intraspace.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SoldeCongeDto {

    private int soldeGlobal;       // Total restant tous types confondus
    private int totalAcquis;       // Total jours acquis (annuel + maladie)
    private int totalUtilises;     // Total jours utilisés (approuvés)
    private int enCoursValidation; // Jours en attente de validation
    private List<SoldeParType> details;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SoldeParType {
        private String type;
        private int acquis;     // Jours acquis pour ce type
        private int utilises;   // Jours approuvés pour ce type
        private int restant;    // acquis - utilises
    }
}
