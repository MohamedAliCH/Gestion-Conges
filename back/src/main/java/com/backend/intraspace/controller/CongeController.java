package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.CongeRequestDto;
import com.backend.intraspace.dtos.CongeResponseDto;
import com.backend.intraspace.services.CongeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/employee/leaves")
@RequiredArgsConstructor
public class CongeController {

    private final CongeService congeService;

    @PostMapping
    public ResponseEntity<CongeResponseDto> requestLeave(@RequestBody CongeRequestDto requestDto, Principal principal) {
        String email = principal.getName();
        CongeResponseDto congeResponseDto = congeService.requestLeave(requestDto, email);
        return ResponseEntity.ok(congeResponseDto);
    }

    @GetMapping
    public ResponseEntity<List<CongeResponseDto>> getMyLeaves(Principal principal) {
        String email = principal.getName();
        List<CongeResponseDto> leaves = congeService.getMyLeaves(email);
        return ResponseEntity.ok(leaves);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long id, Principal principal) {
        String email = principal.getName();
        congeService.cancelLeave(id, email);
        return ResponseEntity.noContent().build();
    }
}
