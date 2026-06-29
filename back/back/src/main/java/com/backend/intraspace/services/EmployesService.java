package com.backend.intraspace.services;

import com.backend.intraspace.dtos.ChangePasswordRequestDto;
import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;

import java.util.List;

public interface EmployesService {
    public EmployeResponseDto createEmploye(EmployeRequestDto employeRequestDto);

    public List<EmployeResponseDto> getAllEmployes();

    public EmployeResponseDto getEmployeById(Long id);

    public EmployeResponseDto updateEmploye(Long id, EmployeRequestDto employeRequestDto);

    public void desactivateEmploye(Long id);

    public void changePassword(String email, ChangePasswordRequestDto requestDto);
}
