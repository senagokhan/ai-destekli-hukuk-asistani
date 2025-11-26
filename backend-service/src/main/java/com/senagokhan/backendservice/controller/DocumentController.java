package com.senagokhan.backendservice.controller;

import com.senagokhan.backendservice.entity.Document;
import com.senagokhan.backendservice.entity.DocumentType;
import com.senagokhan.backendservice.service.CaseFileService;
import com.senagokhan.backendservice.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;


import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final CaseFileService caseFileService;

    public DocumentController(DocumentService documentService, CaseFileService caseFileService) {
        this.documentService = documentService;
        this.caseFileService = caseFileService;
    }
    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @PostMapping("/upload")
    public ResponseEntity<Document> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "caseId", required = false) Long caseId
    ) throws IOException {
        Document uploaded = documentService.upload(file, type, category, caseId);

        if (uploaded.getDocumentType() == DocumentType.CASE_FILE) {
            if (caseId != null) {
                caseFileService.addDocumentToCase(caseId, uploaded);
            } else {
                caseFileService.createCaseFromDocument(uploaded, category);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @GetMapping
    public ResponseEntity<List<Document>> listAll(
            @RequestParam(value = "type", required = false) DocumentType type
    ) {
        if (type != null)
            return ResponseEntity.ok(documentService.listByType(type));
        return ResponseEntity.ok(documentService.listAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @GetMapping("/{id}")
    public ResponseEntity<Document> get(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.get(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource resource = documentService.loadAsResource(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
