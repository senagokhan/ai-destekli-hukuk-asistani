package com.senagokhan.backendservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "case_analysis_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseAnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "case_file_id", nullable = false)
    private CaseFile caseFile;

    @Enumerated(EnumType.STRING)
    private CaseType predictedCaseType;

    private Double confidenceScore;

    @Column(columnDefinition = "jsonb")
    private String topCandidates;

    @Column(columnDefinition = "jsonb")
    private String keywordsMatched;

    @Column(length = 2000)
    private String summaryReason;

    private String modelName;

    private Instant createdAt;
}