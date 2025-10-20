package com.senagokhan.backendservice.entity;

public enum DocumentType {
    LEGAL_BOOK, /** Hukuk kitapları ve akademik kaynaklar */
    CASE_FILE, /** Dava dosyaları (dilekce, tutanak, bilirkisi raporu gibi) */
    COURT_DECISION, /** Mahkeme kararları */
    STATUTE, /** Kanun, yonetmelik ve mevzuat belgeleri */
    OTHER
}
