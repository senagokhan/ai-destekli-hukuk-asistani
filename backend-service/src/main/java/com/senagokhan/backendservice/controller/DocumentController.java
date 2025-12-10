package com.senagokhan.backendservice.controller;

import com.senagokhan.backendservice.entity.Document;
import com.senagokhan.backendservice.entity.DocumentType;
import com.senagokhan.backendservice.service.CaseFileService;
import com.senagokhan.backendservice.service.DocumentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final CaseFileService caseFileService;
    private final WebClient aiWebClient;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public DocumentController(DocumentService documentService,
                              CaseFileService caseFileService,
                              WebClient aiWebClient) {
        this.documentService = documentService;
        this.caseFileService = caseFileService;
        this.aiWebClient = aiWebClient;
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAWYER')")
    @PostMapping("/upload")
    public ResponseEntity<Document> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "caseId", required = false) Long caseId
    ) throws IOException {

        // 1) Normal belge yükleme işlemi
        Document uploaded = documentService.upload(file, type, category, caseId);

        // --------------------------
        // 2) PDF mi? Eğer değilse AI service'e göndermeyiz
        // --------------------------
        Path absolutePath = Paths.get(uploadDir).resolve(uploaded.getStoragePath())
                .toAbsolutePath()
                .normalize();

        String pdfPath = absolutePath.toString();

        if (pdfPath.endsWith(".pdf")) {

            // indexes klasörünü oluştur
            Files.createDirectories(Paths.get("indexes"));

            // index dosyasının yolu
            String indexPath = "indexes/" + uploaded.getId() + ".index";

            // AI service'e gönderilecek body
            Map<String, Object> body = Map.of(
                    "file_path", pdfPath,
                    "index_path", indexPath
            );

            // --------------------------
            // 3) AI service /embeddings/create çağrısı
            // --------------------------
            try {
                Map aiResponse = aiWebClient.post()
                        .uri("/embeddings/create")
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                System.out.println("AI Index Created: " + aiResponse);

                // Document içine indexPath kaydet
                uploaded.setIndexPath(indexPath);
                documentService.update(uploaded);

            } catch (Exception e) {
                System.err.println("AI service hata verdi: " + e.getMessage());
            }
        }

        // --------------------------
        // 4) Belge bir dava dosyasıysa ilişkilendir
        // --------------------------
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
