package com.senagokhan.backendservice.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ChatRequest {

    private String message;
    private Long documentId;

}
