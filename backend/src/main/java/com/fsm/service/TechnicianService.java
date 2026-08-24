
package com.fsm.service;

import com.fsm.entity.Technician;
import com.fsm.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public TechnicianService(TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    // Get all technicians
    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    // Get technician by ID
    public Technician getTechnicianById(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Technician not found with id: " + id
                        )
                );
    }

    // Create technician
public Technician createTechnician(Technician technician) {

    if (technician.getCreatedAt() == null) {
        technician.setCreatedAt(LocalDateTime.now());
    }

    if (technician.getStatus() == null ||
            technician.getStatus().isBlank()) {

        technician.setStatus("AVAILABLE");
    }

    if (technician.getRating() == null) {
        technician.setRating(
                java.math.BigDecimal.ZERO
        );
    }

    // Keep name synchronized with fullName
    if (technician.getName() == null ||
            technician.getName().isBlank()) {

        technician.setName(
                technician.getFullName()
        );
    }

    return technicianRepository.save(technician);
}

    // Update technician
    public Technician updateTechnician(
            Long id,
            Technician technicianDetails) {

        Technician technician =
                getTechnicianById(id);

        technician.setUserId(
                technicianDetails.getUserId()
        );

        technician.setEmployeeCode(
                technicianDetails.getEmployeeCode()
        );

        technician.setFullName(
                technicianDetails.getFullName()
        );

        technician.setEmail(
                technicianDetails.getEmail()
        );

        technician.setPhone(
                technicianDetails.getPhone()
        );

        technician.setSpecialization(
                technicianDetails.getSpecialization()
        );

        technician.setStatus(
                technicianDetails.getStatus()
        );

        technician.setRating(
                technicianDetails.getRating()
        );

        technician.setName(
                technicianDetails.getName()
        );

        return technicianRepository.save(technician);
    }

    // Delete technician
    public void deleteTechnician(Long id) {

        Technician technician =
                getTechnicianById(id);

        technicianRepository.delete(technician);
    }

    // Get technicians by status
    public List<Technician> getTechniciansByStatus(
            String status) {

        return technicianRepository.findByStatus(status);
    }

    // Get technicians by specialization
    public List<Technician> getTechniciansBySpecialization(
            String specialization) {

        return technicianRepository
                .findBySpecialization(specialization);
    }
}

