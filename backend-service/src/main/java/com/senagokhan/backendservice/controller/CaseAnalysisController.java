package com.senagokhan.backendservice.controller;

import com.senagokhan.backendservice.entity.CaseAnalysisResult;
import com.senagokhan.backendservice.service.CaseAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cases")
@RequiredArgsConstructor
public class CaseAnalysisController {

    private final CaseAnalysisService caseAnalysisService;

    @PostMapping("/{id}/analyze")
    public CaseAnalysisResult analyzeCase(@PathVariable Long id) {
        return caseAnalysisService.analyzeCase(id);
    }
}