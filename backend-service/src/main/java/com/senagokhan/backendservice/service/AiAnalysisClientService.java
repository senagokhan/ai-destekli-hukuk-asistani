package com.senagokhan.backendservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiAnalysisClientService {

    private final RestTemplate restTemplate;

    @Value("${app.ai.service.url}")
    private String aiServiceUrl;

    public Map<String, Object> callAiService(String indexName) {

        Map<String, String> request = Map.of(
                "index_name", indexName
        );

        return restTemplate.postForObject(
                aiServiceUrl + "/case/classify",
                request,
                Map.class
        );
    }
}