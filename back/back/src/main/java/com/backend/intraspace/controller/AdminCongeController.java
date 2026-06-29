package com.backend.intraspace.controller;

import com.backend.intraspace.dtos.CongeResponseDto;
import com.backend.intraspace.services.CongeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/conges")
@RequiredArgsConstructor
public class AdminCongeController {

    private final CongeService congeService;

    @GetMapping
    public ResponseEntity<List<CongeResponseDto>> getAllLeaves() {
        List<CongeResponseDto> leaves = congeService.getAllLeaves();
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<CongeResponseDto>> getPendingLeaves() {
        List<CongeResponseDto> leaves = congeService.getPendingLeaves();
        return ResponseEntity.ok(leaves);
    }

    @PutMapping("/{id}/approuver")
    public ResponseEntity<CongeResponseDto> approveLeave(@PathVariable Long id) {
        CongeResponseDto updated = congeService.approveLeave(id);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/refuser")
    public ResponseEntity<CongeResponseDto> rejectLeave(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        if (reason == null) {
            reason = payload.get("refusMotif");
        }
        CongeResponseDto updated = congeService.rejectLeave(id, reason);
        return ResponseEntity.ok(updated);
    }
}
