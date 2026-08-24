package com.fsm.controller;

import com.fsm.entity.Technician;
import com.fsm.service.TechnicianService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(
        origins = "http://localhost:5174",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(
            TechnicianService technicianService) {

        this.technicianService = technicianService;
    }

    // GET ALL TECHNICIANS
    @GetMapping
    public ResponseEntity<List<Technician>> getAllTechnicians() {

        return ResponseEntity.ok(
                technicianService.getAllTechnicians()
        );
    }

    // GET TECHNICIAN BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Technician> getTechnicianById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                technicianService.getTechnicianById(id)
        );
    }

    // CREATE TECHNICIAN
    @PostMapping
    public ResponseEntity<Technician> createTechnician(
            @RequestBody Technician technician) {

        Technician savedTechnician =
                technicianService.createTechnician(technician);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedTechnician);
    }

    // UPDATE TECHNICIAN
    @PutMapping("/{id}")
    public ResponseEntity<Technician> updateTechnician(
            @PathVariable Long id,
            @RequestBody Technician technician) {

        return ResponseEntity.ok(
                technicianService.updateTechnician(
                        id,
                        technician
                )
        );
    }

    // DELETE TECHNICIAN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTechnician(
            @PathVariable Long id) {

        technicianService.deleteTechnician(id);

        return ResponseEntity.noContent().build();
    }

    // GET BY STATUS
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Technician>>
    getTechniciansByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                technicianService
                        .getTechniciansByStatus(status)
        );
    }

    // GET BY SPECIALIZATION
    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<Technician>>
    getTechniciansBySpecialization(
            @PathVariable String specialization) {

        return ResponseEntity.ok(
                technicianService
                        .getTechniciansBySpecialization(
                                specialization
                        )
        );
    }
}