package com.senagokhan.backendservice.controller;

import com.senagokhan.backendservice.entity.CaseFile;
import com.senagokhan.backendservice.entity.Document;
import com.senagokhan.backendservice.service.CaseFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class CaseFileController {

    private final CaseFileService caseFileService;

    public CaseFileController(CaseFileService caseFileService) {
        this.caseFileService = caseFileService;
    }
    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @GetMapping
    public List<CaseFile> getAllCases() {
        return caseFileService.getAllCases();
    }
    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @GetMapping("/{id}")
    public ResponseEntity<CaseFile> getCaseById(@PathVariable Long id) {
        CaseFile caseFile = caseFileService.getCaseById(id);
        return ResponseEntity.ok(caseFile);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @PostMapping
    public ResponseEntity<CaseFile> createCase(@RequestBody CaseFile caseFile) {
        CaseFile saved = caseFileService.createCase(caseFile);
        return ResponseEntity.ok(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable Long id) {
        caseFileService.deleteCase(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @PostMapping("/{id}/documents")
    public ResponseEntity<CaseFile> addDocumentToCase(@PathVariable Long id,
                                                      @RequestBody Document document) {
        CaseFile updated = caseFileService.addDocumentToCase(id, document);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<CaseFile> updateCaseStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.get("status");
        CaseFile updatedCase = caseFileService.updateCaseStatus(id, newStatus);
        return ResponseEntity.ok(updatedCase);
    }

}
