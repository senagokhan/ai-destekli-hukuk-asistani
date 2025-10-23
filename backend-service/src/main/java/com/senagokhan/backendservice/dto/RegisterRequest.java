package com.senagokhan.backendservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String username,
        @Email String email,
        @Size(min = 8, message = "Şifreniz en az 8 karakter uzunluğunda olmalı") String password
) {}
