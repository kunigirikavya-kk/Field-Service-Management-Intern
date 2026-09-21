package com.fsm.repository;

import com.fsm.entity.JobExecution;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobExecutionRepository
        extends JpaRepository<JobExecution, Long> {

    // =====================================================
    // FIND BY SCHEDULE
    // =====================================================

    Optional<JobExecution> findByScheduleId(
            Long scheduleId
    );

    // =====================================================
    // FIND BY TECHNICIAN
    // =====================================================

    List<JobExecution> findByTechnicianId(
            Long technicianId
    );

    // =====================================================
    // FIND BY WORK ORDER
    // =====================================================

    List<JobExecution> findByWorkOrderId(
            Long workOrderId
    );

    // =====================================================
    // FIND BY STATUS
    // =====================================================

    List<JobExecution> findByStatus(
            JobExecution.Status status
    );

    // =====================================================
    // CHECK EXISTING EXECUTION FOR WORK ORDER
    // =====================================================

    boolean existsByWorkOrderIdAndStatus(
            Long workOrderId,
            JobExecution.Status status
    );
}