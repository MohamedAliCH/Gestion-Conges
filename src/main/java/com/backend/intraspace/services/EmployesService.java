package com.backend.intraspace.services;

import com.backend.intraspace.dtos.CreateEmployeeRequest;
import com.backend.intraspace.dtos.EmployeeResponse;

import java.util.List;

public interface EmployesService {
    EmployeeResponse creerEmploye(CreateEmployeeRequest req);
    List<EmployeeResponse> listerTous();
}
