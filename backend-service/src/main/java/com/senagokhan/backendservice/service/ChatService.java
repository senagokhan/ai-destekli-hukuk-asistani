package com.senagokhan.backendservice.service;

import com.senagokhan.backendservice.dto.ChatRequest;
import com.senagokhan.backendservice.dto.ChatResponse;
import com.senagokhan.backendservice.entity.Document;
import com.senagokhan.backendservice.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChatService {

    private final RestTemplate restTemplate;
    private final DocumentRepository documentRepository;

    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    public ChatService(
            RestTemplate restTemplate,
            DocumentRepository documentRepository
    ) {
        this.restTemplate = restTemplate;
        this.documentRepository = documentRepository;
    }

    public ChatResponse askAi(ChatRequest req) {

        // 0️⃣ Belge seçilmemişse
        if (req.getDocumentId() == null) {
            throw new IllegalArgumentException("Document seçilmeden soru sorulamaz");
        }

        // 1️⃣ Document'i bul
        Document document = documentRepository.findById(req.getDocumentId())
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        // 2️⃣ DB'deki index bilgisinden SADECE dosya adını al
        // Örn: "indexes/27.index" → "27.index"
        String rawIndexPath = document.getIndexPath();

        if (rawIndexPath == null || rawIndexPath.isBlank()) {
            throw new IllegalStateException("Document için index bilgisi bulunamadı");
        }

        String indexName = Paths.get(rawIndexPath)
                .getFileName()
                .toString();

        System.out.println("USING INDEX NAME = " + indexName);

        // 3️⃣ Python (AI) servisine gönderilecek payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", req.getMessage());
        payload.put("index_name", indexName);
        payload.put("top_k", 3);

        // 4️⃣ AI servisine istek
        Map<?, ?> aiResponse;
        try {
            aiResponse = restTemplate.postForObject(
                    aiServiceUrl + "/rag/answer",
                    payload,
                    Map.class
            );
        } catch (Exception ex) {
            throw new IllegalStateException(
                    "AI servisine istek atılırken hata oluştu", ex
            );
        }

        if (aiResponse == null) {
            throw new IllegalStateException("AI servisinden boş cevap alındı");
        }

        // 5️⃣ Cevabı map'ten çıkar
        ChatResponse response = new ChatResponse();
        response.setAnswer((String) aiResponse.get("answer"));
        response.setContextUsed((String) aiResponse.get("context_used"));

        return response;
    }
}
