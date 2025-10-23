package com.senagokhan.backendservice.auth.service;

import com.senagokhan.backendservice.auth.entity.Role;
import com.senagokhan.backendservice.auth.entity.User;
import com.senagokhan.backendservice.dto.*;
import com.senagokhan.backendservice.auth.repository.RoleRepository;
import com.senagokhan.backendservice.auth.repository.UserRepository;
import com.senagokhan.backendservice.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public void register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.username()))
            throw new IllegalArgumentException("Username already exists");
        if (userRepo.existsByEmail(req.email()))
            throw new IllegalArgumentException("Email already exists");

        Role defaultRole = roleRepo.findByName("ROLE_LAWYER")
                .orElseGet(() -> roleRepo.save(Role.builder().name("ROLE_LAWYER").build()));

        User user = User.builder()
                .username(req.username())
                .email(req.email())
                .password(encoder.encode(req.password()))
                .roles(Set.of(defaultRole))
                .build();

        userRepo.save(user);
    }

    public TokenResponse login(LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password())
        );

        User user = userRepo.findByUsername(req.username()).orElseThrow();
        var roles = user.getRoles().stream().map(Role::getName).toList();

        String access = jwtUtil.generateAccessToken(user.getUsername(), roles);
        String refresh = jwtUtil.generateRefreshToken(user.getUsername());
        return new TokenResponse(access, refresh, "Bearer");
    }

    public TokenResponse refresh(RefreshRequest req) {
        if (!jwtUtil.isValid(req.refreshToken()))
            throw new IllegalArgumentException("Invalid refresh token");

        String username = jwtUtil.getUsername(req.refreshToken());
        User user = userRepo.findByUsername(username).orElseThrow();

        var roles = user.getRoles().stream().map(Role::getName).toList();
        String access = jwtUtil.generateAccessToken(username, roles);
        String newRefresh = jwtUtil.generateRefreshToken(username);

        return new TokenResponse(access, newRefresh, "Bearer");
    }

    public UserProfileResponse currentUser(String username) {
        User u = userRepo.findByUsername(username).orElseThrow();
        return new UserProfileResponse(u.getId(), u.getUsername(), u.getEmail());
    }
}