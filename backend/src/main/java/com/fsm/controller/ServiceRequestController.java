// ServiceRequestController.java

package com.fsm.controller;

import com.fsm.dto.ServiceRequestRequest;
import com.fsm.entity.ServiceRequest;
import com.fsm.service.ServiceRequestService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@CrossOrigin(origins = "http://localhost:5174")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(
            ServiceRequestService serviceRequestService) {

        this.serviceRequestService =
                serviceRequestService;
    }

    // =====================================================
    // GET ALL SERVICE REQUESTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ServiceRequest>>
    getAllServiceRequests() {

        return ResponseEntity.ok(
                serviceRequestService
                        .getAllServiceRequests()
        );
    }

    // =====================================================
    // GET SERVICE REQUEST BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequest>
    getServiceRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                serviceRequestService
                        .getServiceRequestById(id)
        );
    }

    // =====================================================
    // CREATE SERVICE REQUEST
    // =====================================================

    @PostMapping
    public ResponseEntity<ServiceRequest>
    createServiceRequest(
            @RequestBody ServiceRequestRequest request) {

        ServiceRequest createdRequest =
                serviceRequestService
                        .createServiceRequest(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdRequest);
    }
}