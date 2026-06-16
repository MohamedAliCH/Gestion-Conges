package com.backend.intraspace.services;

import com.backend.intraspace.dtos.CreateEmployeeRequest;
import com.backend.intraspace.dtos.EmployeeResponse;

import java.util.List;

import com.backend.intraspace.dtos.ChangePasswordRequestDto;
import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;

import java.util.List;

public interface EmployesService {
    EmployeeResponse creerEmploye(CreateEmployeeRequest req);
    List<EmployeeResponse> listerTous();
    public EmployeResponseDto createEmploye(EmployeRequestDto employeRequestDto);

    public List<EmployeResponseDto> getAllEmployes();

    public EmployeResponseDto getEmployeById(Long id);

    public EmployeResponseDto updateEmploye(Long id, EmployeRequestDto employeRequestDto);

    public void desactivateEmploye(Long id);

    public void changePassword(String email, ChangePasswordRequestDto requestDto);



}
