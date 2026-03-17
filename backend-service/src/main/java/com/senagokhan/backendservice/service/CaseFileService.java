package com.senagokhan.backendservice.service;

import com.senagokhan.backendservice.entity.*;
import com.senagokhan.backendservice.repository.CaseFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CaseFileService {

    private final CaseFileRepository caseFileRepository;

    public CaseFileService(CaseFileRepository caseFileRepository) {
        this.caseFileRepository = caseFileRepository;
    }

    public List<CaseFile> getAllCases() {
        return caseFileRepository.findAll();
    }

    public CaseFile createCase(CaseFile caseFile) {
        return caseFileRepository.save(caseFile);
    }

    public CaseFile getCaseById(Long id) {
        return caseFileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dava bulunamadı: " + id));
    }

    public void deleteCase(Long id) {
        caseFileRepository.deleteById(id);
    }

    public void createCaseFromDocument(Document document, String category) {

        CaseType caseType;

        if (category != null && !category.isBlank()) {
            caseType = CaseType.valueOf(category);
        } else {
            caseType = CaseType.DIGER;
        }

        CaseFile caseFile = CaseFile.builder()
                .title(document.getOriginalFilename())
                .category(caseType)
                .openedDate(LocalDate.now())
                .description(" Dava dosyası")
                .status("PENDING")
                .build();

        caseFile.addDocument(document);

        caseFileRepository.save(caseFile);
    }

    public CaseFile addDocumentToCase(Long caseId, Document document) {
        CaseFile caseFile = getCaseById(caseId);
        caseFile.getDocuments().add(document);
        return caseFileRepository.save(caseFile);
    }

    public CaseFile updateCaseStatus(Long id, String newStatus) {
        CaseFile caseFile = getCaseById(id);
        caseFile.setStatus(newStatus);
        return caseFileRepository.save(caseFile);
    }

}
