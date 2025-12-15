package com.senagokhan.backendservice.controller;

import com.senagokhan.backendservice.dto.ChatRequest;
import com.senagokhan.backendservice.dto.ChatResponse;
import com.senagokhan.backendservice.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req) {
        ChatResponse response = chatService.askAi(req);
        return ResponseEntity.ok(response);
    }
}