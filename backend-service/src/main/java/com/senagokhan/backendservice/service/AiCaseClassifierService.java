package com.senagokhan.backendservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiCaseClassifierService {

    private final RestTemplate restTemplate;

    private final String AI_URL = "http://localhost:8000/case/classify";

    public Map<String, Object> classifyCase(String text) {

        Map<String, String> request = Map.of(
                "text", text
        );

        return restTemplate.postForObject(
                AI_URL,
                request,
                Map.class
        );
    }
}