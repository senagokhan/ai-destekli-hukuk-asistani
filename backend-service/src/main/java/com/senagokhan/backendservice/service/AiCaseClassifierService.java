package com.senagokhan.backendservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiCaseClassifierService {

    private final RestTemplate restTemplate;

    @Value("${app.ai.service.url}")
    private String aiServiceUrl;

    public Map<String, Object> classifyCase(String text) {

        Map<String, String> request = Map.of(
                "text", text
        );

        return restTemplate.postForObject(
                aiServiceUrl + "/case/classify",
                request,
                Map.class
        );
    }
}