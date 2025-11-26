package com.senagokhan.backendservice.entity;

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

    private String category;

    private LocalDate openedDate;

    @Column(length = 2000)
    private String description;

    @Column(length = 20, nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "case_id")
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

}
