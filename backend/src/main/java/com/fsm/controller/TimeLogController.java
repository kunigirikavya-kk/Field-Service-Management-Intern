package com.fsm.controller;

import com.fsm.entity.TimeLog;
import com.fsm.service.TimeLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/time-logs")
public class TimeLogController {
    private final TimeLogService service;
    public TimeLogController(TimeLogService service){this.service=service;}

    @PostMapping
    public ResponseEntity<TimeLog> create(@RequestBody TimeLog log){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.log(log));
    }

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<TimeLog>> byWorkOrder(@PathVariable Long workOrderId){
        return ResponseEntity.ok(service.getByWorkOrder(workOrderId));
    }
}