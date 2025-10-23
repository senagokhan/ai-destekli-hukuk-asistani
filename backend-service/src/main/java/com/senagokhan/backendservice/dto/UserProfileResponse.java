package com.senagokhan.backendservice.dto;

public record UserProfileResponse(
        Long id,
        String username,
        String email
) {}

