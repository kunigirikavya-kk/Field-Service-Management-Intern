package com.fsm.service;

import com.fsm.entity.Technician;
import com.fsm.repository.TechnicianRepository;
import com.fsm.repository.UserRepository;
import com.fsm.entity.User;
import com.fsm.entity.Role;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;

    public TechnicianService(
            TechnicianRepository technicianRepository,
            UserRepository userRepository,
            AuthorizationService authorizationService) {

        this.technicianRepository = technicianRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
    }

    // =====================================================
    // GET ALL TECHNICIANS
    // =====================================================

    public List<Technician> getAllTechnicians() {
        if (!authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")) {
            throw new AccessDeniedException("Only Dispatcher or Manager can view all technicians");
        }
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

        if (authorizationService.hasRole("TECHNICIAN") &&
                !authorizationService.isCurrentTechnicianByUserId(userId)) {
            throw new AccessDeniedException("You are not allowed to access another technician's profile");
        }

        if (!authorizationService.hasRole("TECHNICIAN") &&
                !authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")) {
            throw new AccessDeniedException("You don't have permission to access technician profiles");
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

        if (!authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")) {
            throw new AccessDeniedException("Only Dispatcher or Manager can create technicians");
        }

        if (technician.getEmail() == null || technician.getEmail().isBlank()) {
            throw new RuntimeException("Technician email is required");
        }

        User user = userRepository.findByEmail(technician.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException(
                        "No user account exists for this email. Create/register the technician user first."));

        if (user.getRole() != Role.TECHNICIAN) {
            throw new RuntimeException("The selected email belongs to a " + user.getRole() + " account, not a TECHNICIAN.");
        }

        technician.setUserId(user.getId());

        if (technicianRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("A technician profile already exists for this user account.");
        }

        if (technician.getEmployeeCode() == null || technician.getEmployeeCode().isBlank()) {
            throw new RuntimeException("Employee code is required");
        }

        String employeeCode = technician.getEmployeeCode().trim();
        if (technicianRepository.existsByEmployeeCode(employeeCode)) {
            throw new RuntimeException("Employee code already exists: " + employeeCode);
        }
        technician.setEmployeeCode(employeeCode);

        if (technician.getRating() != null &&
                (technician.getRating().compareTo(BigDecimal.ZERO) < 0 ||
                 technician.getRating().compareTo(new BigDecimal("5.00")) > 0)) {
            throw new RuntimeException("Rating must be between 0 and 5");
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