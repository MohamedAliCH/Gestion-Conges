package com.backend.intraspace.repositories;

import com.backend.intraspace.entities.Conge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface CongeRepository extends JpaRepository<Conge, Long> {
    List<Conge> findByEmployeEmailOrderByDateDebutDesc(String email);
    List<Conge> findByEmployeIdOrderByDateDebutDesc(Long id);
    List<Conge> findAllByOrderByDateDebutDesc();
    List<Conge> findByStatusOrderByDateDebutDesc(String status);

    @Query("SELECT c FROM Conge c WHERE c.status = 'Approuvé' " +
           "AND c.dateDebut <= :dateFin AND c.dateFin >= :dateDebut " +
           "AND c.employe.id != :employeId")
    List<Conge> findApprovedOverlapping(
        @Param("dateDebut") LocalDate dateDebut,
        @Param("dateFin") LocalDate dateFin,
        @Param("employeId") Long employeId
    );

    @Query("SELECT COALESCE(SUM(c.days), 0) FROM Conge c WHERE c.employe.id = :employeId AND c.type = :type AND c.status = 'Approuvé'")
    int sumApprovedDaysByTypeAndEmploye(@Param("employeId") Long employeId, @Param("type") String type);
}

