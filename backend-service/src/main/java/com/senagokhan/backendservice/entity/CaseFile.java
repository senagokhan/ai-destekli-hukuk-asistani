package com.senagokhan.backendservice.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "case_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    private CaseType category;

    private LocalDate openedDate;

    @Column(length = 2000)
    private String description;

    @Column(length = 20, nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @OneToMany(mappedBy = "caseFile", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonManagedReference
    private List<Document> documents = new ArrayList<>();

    public void addDocument(Document document) {
        documents.add(document);
        document.setCaseFile(this);
    }

    public void removeDocument(Document document) {
        documents.remove(document);
        document.setCaseFile(null);
    }
}
