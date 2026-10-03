package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.EmployeRequestDto;
import com.backend.intraspace.dtos.EmployeResponseDto;
import com.backend.intraspace.services.EmployesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/employes")
@RequiredArgsConstructor
public class EmployeController {
    private final EmployesService employesService;

    @PostMapping
    public ResponseEntity<EmployeResponseDto> create(@RequestBody EmployeRequestDto employeRequestDto) {
        EmployeResponseDto employeResponseDto = employesService.createEmploye(employeRequestDto);
        return ResponseEntity.ok(employeResponseDto);
    }

    @GetMapping
    public ResponseEntity<List<EmployeResponseDto>> getAll() {
        List<EmployeResponseDto> employeResponseDto = employesService.getAllEmployes();
        return ResponseEntity.ok(employeResponseDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeResponseDto> getById(@PathVariable Long id) {
        EmployeResponseDto employeResponseDto = employesService.getEmployeById(id);
        return ResponseEntity.ok(employeResponseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeResponseDto> update(@PathVariable Long id, @RequestBody EmployeRequestDto employeRequestDto) {
        EmployeResponseDto employeResponseDto = employesService.updateEmploye(id, employeRequestDto);
        return ResponseEntity.ok(employeResponseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivate(@PathVariable Long id) {
        employesService.desactivateEmploye(id);
        return ResponseEntity.noContent().build();
    }
}
