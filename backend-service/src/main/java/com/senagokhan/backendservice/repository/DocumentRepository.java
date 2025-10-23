package com.senagokhan.backendservice.repository;

import com.senagokhan.backendservice.entity.Document;
import com.senagokhan.backendservice.entity.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByDocumentType(DocumentType type);
}
