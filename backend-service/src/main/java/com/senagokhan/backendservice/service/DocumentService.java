package com.senagokhan.backendservice.service;

import com.senagokhan.backendservice.entity.Document;
import com.senagokhan.backendservice.entity.DocumentType;
import com.senagokhan.backendservice.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CaseFileService caseFileService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository, CaseFileService caseFileService) {
        this.documentRepository = documentRepository;
        this.caseFileService = caseFileService;
    }

    public Document upload(MultipartFile file, String type, String category, Long caseId) throws IOException {
        validateMultipart(file);

        Path dir = ensureUploadDir();
        String original = sanitizeOriginalName(file.getOriginalFilename());
        String ext = getExtensionOrDefault(original, ".pdf");
        String stored = generateStoredName(ext);
        Path saved = saveToDisk(file, dir, stored);

        DocumentType docType = resolveTypeOrDefault(type);

        Document doc = Document.builder()
                .originalFilename(original)
                .storedFilename(stored)
                .contentType(file.getContentType())
                .sizeBytes(file.getSize())
                .storagePath(dir.relativize(saved).toString())
                .documentType(docType)
                .uploadedAt(Instant.now())
                .build();

        Document savedDoc = documentRepository.save(doc);

        if (caseId != null) {
            caseFileService.addDocumentToCase(caseId, savedDoc);
        }
        else if (docType == DocumentType.CASE_FILE) {
            caseFileService.createCaseFromDocument(savedDoc, category);
        }

        return savedDoc;
    }

    public List<Document> listAll() {
        return documentRepository.findAll();
    }

    public List<Document> listByType(DocumentType type) {
        return documentRepository.findByDocumentType(type);
    }

    public Document get(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Belge bulunamadı: " + id));
    }

    public void delete(Long id) throws IOException {
        Document d = get(id);
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path file = dir.resolve(d.getStoragePath());
        try {
            Files.deleteIfExists(file);
        } finally {
            documentRepository.deleteById(id);
        }
    }

    public Resource loadAsResource(Long id) {
        Document d = get(id);
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path file = dir.resolve(d.getStoragePath());
        return new FileSystemResource(file.toFile());
    }

    private Path ensureUploadDir() throws IOException {
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        return dir;
    }

    private void validateMultipart(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Dosya boş olamaz");
        }
        String ct = file.getContentType();
        if (ct != null && !ct.equalsIgnoreCase("application/pdf")) {
            throw new IllegalArgumentException("Sadece PDF yükleyebilirsiniz");
        }
        if (!looksLikePdf(file)) {
            throw new IllegalArgumentException("Dosya PDF formatında değil");
        }
    }

    private boolean looksLikePdf(MultipartFile file) throws IOException {
        byte[] header = new byte[Math.min(5, (int) file.getSize())];
        try (var in = file.getInputStream()) {
            int read = in.read(header);
            if (read < 5) return false;
        }
        String sig = new String(header);
        return sig.startsWith("%PDF-");
    }

    private String sanitizeOriginalName(String original) {
        if (original == null) return "file.pdf";
        String cleaned = StringUtils.cleanPath(original);
        if (cleaned.contains("..")) {
            throw new IllegalArgumentException("Geçersiz dosya adı");
        }
        return cleaned;
    }

    private String getExtensionOrDefault(String filename, String def) {
        int idx = filename.lastIndexOf('.');
        if (idx == -1) return def;
        return filename.substring(idx);
    }

    private String generateStoredName(String extension) {
        return UUID.randomUUID() + extension;
    }

    private DocumentType resolveTypeOrDefault(String type) {
        if (type == null || type.isBlank()) return DocumentType.LEGAL_BOOK;
        return DocumentType.valueOf(type.trim().toUpperCase());
    }

    private Path saveToDisk(MultipartFile file, Path dir, String stored) throws IOException {
        Path target = dir.resolve(stored);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return target;
    }
}
