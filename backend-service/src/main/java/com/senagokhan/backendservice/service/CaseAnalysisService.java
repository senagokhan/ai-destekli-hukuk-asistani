package com.senagokhan.backendservice.service;

import com.senagokhan.backendservice.entity.CaseAnalysisResult;
import com.senagokhan.backendservice.entity.CaseFile;
import com.senagokhan.backendservice.entity.CaseType;
import com.senagokhan.backendservice.repository.CaseAnalysisResultRepository;
import com.senagokhan.backendservice.repository.CaseFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CaseAnalysisService {

    private final CaseFileRepository caseFileRepository;
    private final CaseAnalysisResultRepository analysisRepository;
    private final AiAnalysisClientService aiClient;

    public CaseAnalysisResult analyzeCase(Long caseId) {

        CaseFile caseFile = caseFileRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        //  DOCUMENT KONTROL
        if (caseFile.getDocuments() == null || caseFile.getDocuments().isEmpty()) {
            throw new RuntimeException("No document found for this case");
        }

        // INDEX PATH AL
        String rawIndexPath = caseFile.getDocuments().get(0).getIndexPath();

        if (rawIndexPath == null || rawIndexPath.isBlank()) {
            throw new RuntimeException("Index path is missing for document");
        }

        String indexName = rawIndexPath.replace("indexes/", "");

        //  AI SERVİS ÇAĞRISI
        Map<String, Object> aiResponse = aiClient.callAiService(indexName);

        //  RESPONSE PARSE
        String predictedType = (String) aiResponse.get("predictedCaseType");

        CaseType caseType;
        try {
            caseType = CaseType.valueOf(predictedType);
        } catch (Exception e) {
            caseType = CaseType.DIGER;
        }

        Double confidence = Double.valueOf(aiResponse.get("confidenceScore").toString());
        String summary = (String) aiResponse.get("summaryReason");

        //  CASE UPDATE
        caseFile.setCategory(caseType);
        caseFileRepository.save(caseFile);

        //  RESULT SAVE
        CaseAnalysisResult result = CaseAnalysisResult.builder()
                .caseFile(caseFile)
                .predictedCaseType(caseType)
                .confidenceScore(confidence)
                .summaryReason(summary)
                .modelName("all-MiniLM-L6-v2")
                .createdAt(Instant.now())
                .build();

        return analysisRepository.save(result);
    }
}