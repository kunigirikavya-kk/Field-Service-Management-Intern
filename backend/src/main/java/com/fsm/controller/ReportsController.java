package com.fsm.controller;

import com.fsm.service.ReportsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {
    private final ReportsService service;
    public ReportsController(ReportsService service){this.service=service;}

    @GetMapping("/summary")
    public ResponseEntity<Map<String,Object>> summary(){return ResponseEntity.ok(service.summary());}
}