package com.senagokhan.backendservice.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ChatResponse {
    private String answer;
    private String contextUsed;

}