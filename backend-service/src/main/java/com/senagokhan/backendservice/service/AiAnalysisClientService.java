package com.senagokhan.backendservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiAnalysisClientService {

    private final RestTemplate restTemplate;

    private final String AI_URL = "http://localhost:8000/case/classify";

    public Map<String, Object> callAiService(String indexName) {

        Map<String, String> request = Map.of(
                "index_name", indexName
        );

        return restTemplate.postForObject(
                AI_URL,
                request,
                Map.class
        );
    }
}