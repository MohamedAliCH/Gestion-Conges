package com.backend.intraspace.services;

import com.backend.intraspace.dtos.CongeRequestDto;
import com.backend.intraspace.dtos.CongeResponseDto;
import java.util.List;

public interface CongeService {
    CongeResponseDto requestLeave(CongeRequestDto requestDto, String email);
    List<CongeResponseDto> getMyLeaves(String email);
    void cancelLeave(Long id, String email);
    List<CongeResponseDto> getAllLeaves();
    List<CongeResponseDto> getPendingLeaves();
    CongeResponseDto approveLeave(Long id);
    CongeResponseDto rejectLeave(Long id, String reason);
}

