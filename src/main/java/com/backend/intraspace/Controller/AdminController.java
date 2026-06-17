package com.backend.intraspace.Controller;

import com.backend.intraspace.dtos.CreateEmployeeRequest;
import com.backend.intraspace.dtos.EmployeeResponse;
import com.backend.intraspace.services.EmployesService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final EmployesService employesService;

    public AdminController(EmployesService employesService) {
        this.employesService = employesService;
    }

    @PostMapping("/employees")
    public ResponseEntity<EmployeeResponse> creerEmploye(@Valid @RequestBody CreateEmployeeRequest req) {
        EmployeeResponse rep = employesService.creerEmploye(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(rep);
    }

    @GetMapping("/employees")
    public List<EmployeeResponse> listerEmployes() {
        return employesService.listerTous();
    }
}
