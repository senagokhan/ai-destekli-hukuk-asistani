package com.senagokhan.backendservice.controller;

import com.senagokhan.backendservice.entity.CaseFile;
import com.senagokhan.backendservice.entity.Document;
import com.senagokhan.backendservice.service.CaseFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseFileController {

    private final CaseFileService caseFileService;

    @GetMapping
    public List<CaseFile> getAllCases() {
        return caseFileService.getAllCases();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseFile> getCaseById(@PathVariable Long id) {
        CaseFile caseFile = caseFileService.getCaseById(id);
        return ResponseEntity.ok(caseFile);
    }

    @PostMapping
    public ResponseEntity<CaseFile> createCase(@RequestBody CaseFile caseFile) {
        CaseFile saved = caseFileService.createCase(caseFile);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable Long id) {
        caseFileService.deleteCase(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<CaseFile> addDocumentToCase(@PathVariable Long id,
                                                      @RequestBody Document document) {
        CaseFile updated = caseFileService.addDocumentToCase(id, document);
        return ResponseEntity.ok(updated);
    }
}
