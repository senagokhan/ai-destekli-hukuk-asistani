package com.senagokhan.backendservice.repository;

import com.senagokhan.backendservice.entity.CaseAnalysisResult;
import com.senagokhan.backendservice.entity.CaseFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CaseAnalysisResultRepository extends JpaRepository<CaseAnalysisResult, Long> {

    Optional<CaseAnalysisResult> findByCaseFile(CaseFile caseFile);

}
