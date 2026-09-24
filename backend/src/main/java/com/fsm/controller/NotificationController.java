package com.fsm.controller;

import com.fsm.entity.Notification;
import com.fsm.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    public NotificationController(NotificationService service){this.service=service;}

    @GetMapping
    public ResponseEntity<List<Notification>> mine(){return ResponseEntity.ok(service.mine());}

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id){service.markRead(id); return ResponseEntity.noContent().build();}
}