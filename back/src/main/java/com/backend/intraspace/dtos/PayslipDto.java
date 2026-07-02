package com.backend.intraspace.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayslipDto {

    private String period;
    private int month;
    private int year;

    private String employeeFirstName;
    private String employeeLastName;
    private String email;
    private String cin;
    private String phone;
    private String departement;
    private String poste;
    private String dateEmbauche;

    private BigDecimal brut;

    // CNSS breakdown (total 9.18 %)
    private BigDecimal cnssRetraite;          // 4.74 %
    private BigDecimal cnssAssuranceMaladie;  // 3.94 %
    private BigDecimal cnssAccidentsTravail;  // 0.50 %
    private BigDecimal cnss;                  // 9.18 % total

    private BigDecimal irpp;
    private BigDecimal totalRetenues;
    private BigDecimal net;

    public static PayslipDto of(
            String firstName, String lastName, String email,
            String cin, String phone,
            String departement, String poste, String dateEmbauche,
            BigDecimal brut, int month, int year, String period) {

        // CNSS components
        BigDecimal retraite   = brut.multiply(new BigDecimal("0.0474")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal cnam       = brut.multiply(new BigDecimal("0.0394")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal accidents  = brut.multiply(new BigDecimal("0.0050")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal cnss       = retraite.add(cnam).add(accidents);

        BigDecimal irpp       = calculateIrpp(brut);
        BigDecimal retenues   = cnss.add(irpp);
        BigDecimal net        = brut.subtract(retenues).setScale(2, RoundingMode.HALF_UP);

        return new PayslipDto(period, month, year,
                firstName, lastName, email, cin, phone,
                departement, poste, dateEmbauche,
                brut, retraite, cnam, accidents, cnss,
                irpp, retenues, net);
    }

    private static BigDecimal calculateIrpp(BigDecimal brut) {
        // Annual taxable income = gross - CNSS - professional expenses (10%, max 2000 DT) - 300 DT personal deduction
        BigDecimal annual     = brut.multiply(BigDecimal.valueOf(12));
        BigDecimal annualCnss = annual.multiply(new BigDecimal("0.0918")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal fraisPro   = annual.multiply(new BigDecimal("0.10")).min(new BigDecimal("2000"));
        BigDecimal taxable    = annual.subtract(annualCnss).subtract(fraisPro).subtract(new BigDecimal("300"));

        if (taxable.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;

        BigDecimal tax = BigDecimal.ZERO;
        // Tunisian IRPP brackets
        tax = tax.add(bracket(taxable, new BigDecimal("5000"),  new BigDecimal("20000"), new BigDecimal("0.26")));
        tax = tax.add(bracket(taxable, new BigDecimal("20000"), new BigDecimal("30000"), new BigDecimal("0.28")));
        tax = tax.add(bracket(taxable, new BigDecimal("30000"), new BigDecimal("50000"), new BigDecimal("0.33")));
        tax = tax.add(bracket(taxable, new BigDecimal("50000"), null,                   new BigDecimal("0.35")));

        return tax.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP).max(BigDecimal.ZERO);
    }

    private static BigDecimal bracket(BigDecimal income, BigDecimal from, BigDecimal to, BigDecimal rate) {
        if (income.compareTo(from) <= 0) return BigDecimal.ZERO;
        BigDecimal upper = to != null ? income.min(to) : income;
        return upper.subtract(from).multiply(rate);
    }
}
