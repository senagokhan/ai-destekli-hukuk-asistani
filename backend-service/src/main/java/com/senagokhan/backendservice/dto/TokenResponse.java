package com.senagokhan.backendservice.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType
) {}
