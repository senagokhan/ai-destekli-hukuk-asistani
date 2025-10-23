package com.senagokhan.backendservice.repository;

import com.senagokhan.backendservice.entity.CaseFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaseFileRepository extends JpaRepository<CaseFile, Long> {
}

