package com.fsm.service;

import com.fsm.entity.Technician;
import com.fsm.repository.TechnicianRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public TechnicianService(
            TechnicianRepository technicianRepository) {

        this.technicianRepository =
                technicianRepository;
    }

    // =====================================================
    // GET ALL TECHNICIANS
    // =====================================================

    public List<Technician> getAllTechnicians() {

        return technicianRepository.findAll();
    }

    // =====================================================
    // GET TECHNICIAN BY ID
    // =====================================================

    public Technician getTechnicianById(Long id) {

        return technicianRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Technician not found with id: "
                                        + id
                        )
                );
    }

    // =====================================================
    // GET TECHNICIAN BY USER ID
    // =====================================================

    public Technician getTechnicianByUserId(Long userId) {

        if (userId == null) {

            throw new RuntimeException(
                    "User ID is required"
            );
        }

        return technicianRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Technician profile not found for user id: "
                                        + userId
                        )
                );
    }

    // =====================================================
    // CREATE TECHNICIAN
    // =====================================================

    public Technician createTechnician(
            Technician technician) {

        // -------------------------------------------------
        // USER ID VALIDATION
        // -------------------------------------------------

        if (technician.getUserId() == null) {

            throw new RuntimeException(
                    "User ID is required"
            );
        }

        // -------------------------------------------------
        // PREVENT DUPLICATE TECHNICIAN PROFILE
        // -------------------------------------------------

        if (technicianRepository
                .existsByUserId(
                        technician.getUserId()
                )) {

            throw new RuntimeException(
                    "A technician profile already exists for user id: "
                            + technician.getUserId()
            );
        }

        // -------------------------------------------------
        // CREATED AT
        // -------------------------------------------------

        if (technician.getCreatedAt() == null) {

            technician.setCreatedAt(
                    LocalDateTime.now()
            );
        }

        // -------------------------------------------------
        // DEFAULT STATUS
        // -------------------------------------------------

        if (
                technician.getStatus() == null ||
                technician.getStatus().isBlank()
        ) {

            technician.setStatus(
                    "AVAILABLE"
            );
        }

        // -------------------------------------------------
        // DEFAULT RATING
        // -------------------------------------------------

        if (technician.getRating() == null) {

            technician.setRating(
                    BigDecimal.ZERO
            );
        }

        // -------------------------------------------------
        // SYNCHRONIZE NAME
        // -------------------------------------------------

        if (
                technician.getName() == null ||
                technician.getName().isBlank()
        ) {

            technician.setName(
                    technician.getFullName()
            );
        }

        return technicianRepository.save(
                technician
        );
    }

    // =====================================================
    // UPDATE TECHNICIAN
    // =====================================================

    public Technician updateTechnician(
            Long id,
            Technician technicianDetails) {

        Technician technician =
                getTechnicianById(id);

        // -------------------------------------------------
        // USER ID
        // -------------------------------------------------

        if (technicianDetails.getUserId() != null &&
                !technicianDetails
                        .getUserId()
                        .equals(technician.getUserId())) {

            if (technicianRepository
                    .existsByUserId(
                            technicianDetails.getUserId()
                    )) {

                throw new RuntimeException(
                        "Another technician already uses user id: "
                                + technicianDetails.getUserId()
                );
            }

            technician.setUserId(
                    technicianDetails.getUserId()
            );
        }

        // -------------------------------------------------
        // EMPLOYEE CODE
        // -------------------------------------------------

        technician.setEmployeeCode(
                technicianDetails.getEmployeeCode()
        );

        // -------------------------------------------------
        // FULL NAME
        // -------------------------------------------------

        technician.setFullName(
                technicianDetails.getFullName()
        );

        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        technician.setEmail(
                technicianDetails.getEmail()
        );

        // -------------------------------------------------
        // PHONE
        // -------------------------------------------------

        technician.setPhone(
                technicianDetails.getPhone()
        );

        // -------------------------------------------------
        // SPECIALIZATION
        // -------------------------------------------------

        technician.setSpecialization(
                technicianDetails.getSpecialization()
        );

        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (
                technicianDetails.getStatus() != null &&
                !technicianDetails
                        .getStatus()
                        .isBlank()
        ) {

            technician.setStatus(
                    technicianDetails.getStatus()
            );
        }

        // -------------------------------------------------
        // RATING
        // -------------------------------------------------

        if (technicianDetails.getRating() != null) {

            technician.setRating(
                    technicianDetails.getRating()
            );
        }

        // -------------------------------------------------
        // NAME
        // -------------------------------------------------

        if (
                technicianDetails.getName() != null &&
                !technicianDetails
                        .getName()
                        .isBlank()
        ) {

            technician.setName(
                    technicianDetails.getName()
            );

        } else {

            technician.setName(
                    technicianDetails.getFullName()
            );
        }

        return technicianRepository.save(
                technician
        );
    }

    // =====================================================
    // DELETE TECHNICIAN
    // =====================================================

    public void deleteTechnician(Long id) {

        Technician technician =
                getTechnicianById(id);

        technicianRepository.delete(
                technician
        );
    }

    // =====================================================
    // GET TECHNICIANS BY STATUS
    // =====================================================

    public List<Technician> getTechniciansByStatus(
            String status) {

        return technicianRepository
                .findByStatus(status);
    }

    // =====================================================
    // GET TECHNICIANS BY SPECIALIZATION
    // =====================================================

    public List<Technician> getTechniciansBySpecialization(
            String specialization) {

        return technicianRepository
                .findBySpecialization(
                        specialization
                );
    }
}