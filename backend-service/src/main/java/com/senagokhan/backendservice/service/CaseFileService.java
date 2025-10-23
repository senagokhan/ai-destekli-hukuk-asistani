package com.senagokhan.backendservice.service;

import com.senagokhan.backendservice.entity.*;
import com.senagokhan.backendservice.repository.CaseFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CaseFileService {

    private final CaseFileRepository caseFileRepository;

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

    public CaseFile createCaseFromDocument(Document document, String category) {

        CaseFile caseFile = CaseFile.builder()
                .title(document.getOriginalFilename())
                .category(
                        (category != null && !category.isBlank())
                                ? category
                                : "Bilinmiyor"
                )
                .openedDate(LocalDate.now())
                .description(" Dava dosyası")
                .status("PENDING")
                .build();

        if (caseFile.getDocuments() == null) {
            caseFile.setDocuments(new ArrayList<>());
        }
        caseFile.getDocuments().add(document);

        return caseFileRepository.save(caseFile);
    }


    public CaseFile addDocumentToCase(Long caseId, Document document) {
        CaseFile caseFile = getCaseById(caseId);
        caseFile.getDocuments().add(document);
        return caseFileRepository.save(caseFile);
    }
}
