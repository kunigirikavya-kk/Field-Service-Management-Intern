package com.fsm.service;

import com.fsm.entity.JobExecution;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.JobExecutionRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobExecutionService {


private final JobExecutionRepository jobExecutionRepository;
private final WorkOrderRepository workOrderRepository;
private final AuthorizationService authorizationService;

// =====================================================
// CONSTRUCTOR
// =====================================================

public JobExecutionService(
        JobExecutionRepository jobExecutionRepository,
        WorkOrderRepository workOrderRepository,
        AuthorizationService authorizationService) {

    this.jobExecutionRepository =
            jobExecutionRepository;

    this.workOrderRepository =
            workOrderRepository;

    this.authorizationService =
            authorizationService;
}

// =====================================================
// GET ALL EXECUTIONS
// =====================================================

public List<JobExecution> getAllExecutions() {

    // Technician should only access their own jobs
    if (authorizationService.hasRole("TECHNICIAN")) {

        Long technicianId =
                authorizationService
                        .getCurrentTechnicianId();

        return jobExecutionRepository
                .findByTechnicianId(
                        technicianId
                );
    }

    // Manager can view all executions
    if (authorizationService.hasRole("MANAGER")) {

        return jobExecutionRepository.findAll();
    }

    throw new AccessDeniedException(
            "You don't have permission to access job executions"
    );
}

// =====================================================
// GET BY ID
// =====================================================

public Optional<JobExecution> getExecutionById(
        Long id) {

    return jobExecutionRepository.findById(id);
}

// =====================================================
// GET BY SCHEDULE
// =====================================================

public Optional<JobExecution> getByScheduleId(
        Long scheduleId) {

    return jobExecutionRepository
            .findByScheduleId(scheduleId);
}

// =====================================================
// START JOB
// =====================================================

public JobExecution startJob(
        JobExecution execution) {

    // -------------------------------------------------
    // VALIDATE TECHNICIAN
    // -------------------------------------------------

    if (execution.getTechnicianId() == null) {

        throw new RuntimeException(
                "Technician ID is required"
        );
    }

    // -------------------------------------------------
    // TECHNICIAN OWNERSHIP
    // -------------------------------------------------

    if (
            authorizationService.hasRole(
                    "TECHNICIAN"
            )
    ) {

        if (
                !authorizationService
                        .isCurrentTechnician(
                                execution.getTechnicianId()
                        )
        ) {

            throw new AccessDeniedException(
                    "You are not allowed to start a job for another technician"
            );
        }
    }

    // -------------------------------------------------
    // WORK ORDER VALIDATION
    // -------------------------------------------------

    if (execution.getWorkOrderId() == null) {

        throw new RuntimeException(
                "Work Order ID is required"
        );
    }

    WorkOrder workOrder =
            workOrderRepository
                    .findById(
                            execution.getWorkOrderId()
                    )
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Work Order not found with id: "
                                            + execution.getWorkOrderId()
                            )
                    );

    // -------------------------------------------------
    // SET JOB EXECUTION STATUS
    // -------------------------------------------------

    execution.setStatus(
            JobExecution.Status.IN_PROGRESS
    );

    // -------------------------------------------------
    // SET START TIME
    // -------------------------------------------------

    execution.setStartedAt(
            LocalDateTime.now()
    );

    // -------------------------------------------------
    // CLEAR COMPLETED TIME
    // -------------------------------------------------

    execution.setCompletedAt(null);

    // -------------------------------------------------
    // UPDATE WORK ORDER STATUS
    // -------------------------------------------------

    workOrder.setStatus(
            WorkOrder.Status.IN_PROGRESS
    );

    workOrderRepository.save(
            workOrder
    );

    // -------------------------------------------------
    // SAVE JOB EXECUTION
    // -------------------------------------------------

    return jobExecutionRepository.save(
            execution
    );
}

// =====================================================
// UPDATE JOB EXECUTION
// =====================================================

public JobExecution updateExecution(
        Long id,
        JobExecution updatedExecution) {

    JobExecution existing =
            jobExecutionRepository
                    .findById(id)
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Job execution not found with id: "
                                            + id
                            )
                    );

    // -------------------------------------------------
    // TECHNICIAN OWNERSHIP
    // -------------------------------------------------

    if (
            authorizationService.hasRole(
                    "TECHNICIAN"
            )
    ) {

        if (
                !authorizationService
                        .isCurrentTechnician(
                                existing.getTechnicianId()
                        )
        ) {

            throw new AccessDeniedException(
                    "You are not allowed to update another technician's job"
            );
        }
    }

    // -------------------------------------------------
    // UPDATE NOTES
    // -------------------------------------------------

    existing.setWorkNotes(
            updatedExecution.getWorkNotes()
    );

    existing.setPartsUsed(
            updatedExecution.getPartsUsed()
    );

    existing.setCompletionNotes(
            updatedExecution.getCompletionNotes()
    );

    return jobExecutionRepository.save(
            existing
    );
}

// =====================================================
// COMPLETE JOB
// =====================================================

public JobExecution completeJob(
        Long id,
        JobExecution updatedExecution) {

    JobExecution existing =
            jobExecutionRepository
                    .findById(id)
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Job execution not found with id: "
                                            + id
                            )
                    );

    // -------------------------------------------------
    // TECHNICIAN OWNERSHIP
    // -------------------------------------------------

    if (
            authorizationService.hasRole(
                    "TECHNICIAN"
            )
    ) {

        if (
                !authorizationService
                        .isCurrentTechnician(
                                existing.getTechnicianId()
                        )
        ) {

            throw new AccessDeniedException(
                    "You are not allowed to complete another technician's job"
            );
        }
    }

    // -------------------------------------------------
    // UPDATE JOB EXECUTION
    // -------------------------------------------------

    existing.setStatus(
            JobExecution.Status.COMPLETED
    );

    existing.setCompletedAt(
            LocalDateTime.now()
    );

    existing.setWorkNotes(
            updatedExecution.getWorkNotes()
    );

    existing.setPartsUsed(
            updatedExecution.getPartsUsed()
    );

    existing.setCompletionNotes(
            updatedExecution.getCompletionNotes()
    );

    // -------------------------------------------------
    // UPDATE WORK ORDER
    // -------------------------------------------------

    WorkOrder workOrder =
            workOrderRepository
                    .findById(
                            existing.getWorkOrderId()
                    )
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Work Order not found with id: "
                                            + existing.getWorkOrderId()
                            )
                    );

    workOrder.setStatus(
            WorkOrder.Status.COMPLETED
    );

    workOrder.setCompletedDate(
            LocalDateTime.now()
    );

    workOrderRepository.save(
            workOrder
    );

    // -------------------------------------------------
    // SAVE JOB EXECUTION
    // -------------------------------------------------

    return jobExecutionRepository.save(
            existing
    );
}

// =====================================================
// CANCEL JOB
// =====================================================

public JobExecution cancelJob(
        Long id) {

    JobExecution execution =
            jobExecutionRepository
                    .findById(id)
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Job execution not found with id: "
                                            + id
                            )
                    );

    // -------------------------------------------------
    // TECHNICIAN OWNERSHIP
    // -------------------------------------------------

    if (
            authorizationService.hasRole(
                    "TECHNICIAN"
            )
    ) {

        if (
                !authorizationService
                        .isCurrentTechnician(
                                execution.getTechnicianId()
                        )
        ) {

            throw new AccessDeniedException(
                    "You are not allowed to cancel another technician's job"
            );
        }
    }

    // -------------------------------------------------
    // UPDATE JOB EXECUTION
    // -------------------------------------------------

    execution.setStatus(
            JobExecution.Status.CANCELLED
    );

    // -------------------------------------------------
    // UPDATE WORK ORDER
    // -------------------------------------------------

    WorkOrder workOrder =
            workOrderRepository
                    .findById(
                            execution.getWorkOrderId()
                    )
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Work Order not found with id: "
                                            + execution.getWorkOrderId()
                            )
                    );

    workOrder.setStatus(
            WorkOrder.Status.CANCELLED
    );

    workOrderRepository.save(
            workOrder
    );

    // -------------------------------------------------
    // SAVE JOB EXECUTION
    // -------------------------------------------------

    return jobExecutionRepository.save(
            execution
    );
}

// =====================================================
// TECHNICIAN JOBS
// =====================================================

public List<JobExecution> getByTechnician(
        Long technicianId) {

    if (technicianId == null) {

        throw new RuntimeException(
                "Technician ID is required"
        );
    }

    // -------------------------------------------------
    // TECHNICIAN CAN ONLY SEE THEIR OWN JOBS
    // -------------------------------------------------

    if (
            authorizationService.hasRole(
                    "TECHNICIAN"
            )
    ) {

        if (
                !authorizationService
                        .isCurrentTechnician(
                                technicianId
                        )
        ) {

            throw new AccessDeniedException(
                    "You are not allowed to access another technician's job executions"
            );
        }

        return jobExecutionRepository
                .findByTechnicianId(
                        technicianId
                );
    }

    // -------------------------------------------------
    // MANAGER
    // -------------------------------------------------

    if (
            authorizationService.hasRole(
                    "MANAGER"
            )
    ) {

        return jobExecutionRepository
                .findByTechnicianId(
                        technicianId
                );
    }

    throw new AccessDeniedException(
            "You don't have permission to access job executions"
    );
}

// =====================================================
// WORK ORDER JOBS
// =====================================================

public List<JobExecution> getByWorkOrder(
        Long workOrderId) {

    if (workOrderId == null) {

        throw new RuntimeException(
                "Work Order ID is required"
        );
    }

    return jobExecutionRepository
            .findByWorkOrderId(
                    workOrderId
            );
}

// =====================================================
// STATUS
// =====================================================

public List<JobExecution> getByStatus(
        JobExecution.Status status) {

    if (status == null) {

        throw new RuntimeException(
                "Status is required"
        );
    }

    return jobExecutionRepository
            .findByStatus(
                    status
            );
}


}
