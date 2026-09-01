package com.fsm.repository;

import com.fsm.entity.Technician;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository
        extends JpaRepository<Technician, Long> {

    // =====================================================
    // FIND BY STATUS
    // =====================================================

    List<Technician> findByStatus(String status);

    // =====================================================
    // FIND BY SPECIALIZATION
    // =====================================================

    List<Technician> findBySpecialization(
            String specialization
    );

    // =====================================================
    // FIND BY STATUS + SPECIALIZATION
    // =====================================================

    List<Technician> findByStatusAndSpecialization(
            String status,
            String specialization
    );

    // =====================================================
    // FIND TECHNICIAN BY USER ID
    // =====================================================

    Optional<Technician> findByUserId(Long userId);

    // =====================================================
    // CHECK DUPLICATE USER ID
    // =====================================================

    boolean existsByUserId(Long userId);
}