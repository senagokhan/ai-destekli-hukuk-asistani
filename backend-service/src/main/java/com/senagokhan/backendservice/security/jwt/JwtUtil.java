package com.senagokhan.backendservice.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long accessExpSeconds;
    private final long refreshExpSeconds;

    public JwtUtil(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-exp-min}") long accessExpMin,
            @Value("${security.jwt.refresh-exp-days}") long refreshExpDays
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpSeconds = accessExpMin * 60;
        this.refreshExpSeconds = refreshExpDays * 24 * 60 * 60;
    }

    public String generateAccessToken(String username, Collection<String> roles) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessExpSeconds)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(refreshExpSeconds)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }

    public String getUsername(String token) {
        return parse(token).getBody().getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException ex) {
            return false;
        }
    }
}
