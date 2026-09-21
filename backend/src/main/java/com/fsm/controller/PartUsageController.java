package com.fsm.controller;

import com.fsm.entity.PartUsage;
import com.fsm.service.PartUsageService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/part-usage")
@CrossOrigin(origins = "http://localhost:5174")
public class PartUsageController {

    private final PartUsageService partUsageService;

    public PartUsageController(PartUsageService partUsageService) {
        this.partUsageService = partUsageService;
    }

    // ==========================================
    // RECORD PART USAGE
    // ==========================================

    @PostMapping
    public ResponseEntity<PartUsage> recordPartUsage(
            @RequestBody PartUsage usage) {

        PartUsage savedUsage =
                partUsageService.recordPartUsage(usage);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedUsage);
    }

    // ==========================================
    // GET PART USAGE BY WORK ORDER
    // ==========================================

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<PartUsage>> getByWorkOrder(
            @PathVariable Long workOrderId) {

        return ResponseEntity.ok(
                partUsageService.getByWorkOrder(workOrderId)
        );
    }

    // ==========================================
    // GET PART USAGE BY JOB EXECUTION
    // ==========================================

    @GetMapping("/job-execution/{jobExecutionId}")
    public ResponseEntity<List<PartUsage>> getByJobExecution(
            @PathVariable Long jobExecutionId) {

        return ResponseEntity.ok(
                partUsageService.getByJobExecution(jobExecutionId)
        );
    }

    // ==========================================
    // GET PART USAGE BY TECHNICIAN
    // ==========================================

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<PartUsage>> getByTechnician(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                partUsageService.getByTechnician(technicianId)
        );
    }

    // ==========================================
    // DELETE PART USAGE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartUsage(
            @PathVariable Long id) {

        partUsageService.deletePartUsage(id);

        return ResponseEntity.noContent().build();
    }
}