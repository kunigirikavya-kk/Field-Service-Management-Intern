package com.fsm.service;

import com.fsm.entity.JobExecution;
import com.fsm.entity.Schedule;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.JobExecutionRepository;
import com.fsm.repository.ScheduleRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobExecutionService {

    private final JobExecutionRepository jobExecutionRepository;
    private final WorkOrderRepository workOrderRepository;
    private final ScheduleRepository scheduleRepository;
    private final AuthorizationService authorizationService;

    public JobExecutionService(
            JobExecutionRepository jobExecutionRepository,
            WorkOrderRepository workOrderRepository,
            ScheduleRepository scheduleRepository,
            AuthorizationService authorizationService) {

        this.jobExecutionRepository = jobExecutionRepository;
        this.workOrderRepository = workOrderRepository;
        this.scheduleRepository = scheduleRepository;
        this.authorizationService = authorizationService;
    }

    // =====================================================
    // GET ALL EXECUTIONS
    // =====================================================

    public List<JobExecution> getAllExecutions() {

        if (authorizationService.hasRole("TECHNICIAN")) {

            Long technicianId =
                    authorizationService.getCurrentTechnicianId();

            return jobExecutionRepository
                    .findByTechnicianId(technicianId);
        }

        if (authorizationService.hasRole("DISPATCHER") ||
            authorizationService.hasRole("MANAGER")) {

            return jobExecutionRepository.findAll();
        }

        throw new AccessDeniedException(
                "You don't have permission to access job executions"
        );
    }

    // =====================================================
    // GET EXECUTION BY ID
    // =====================================================

    public Optional<JobExecution> getExecutionById(Long id) {

        if (id == null) {
            throw new RuntimeException(
                    "Job execution ID is required"
            );
        }

        JobExecution execution =
                jobExecutionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job execution not found with id: "
                                                + id
                                )
                        );

        // -------------------------------------------------
        // DISPATCHER / MANAGER
        // -------------------------------------------------

        if (authorizationService.hasRole("DISPATCHER") ||
            authorizationService.hasRole("MANAGER")) {

            return Optional.of(execution);
        }

        // -------------------------------------------------
        // TECHNICIAN
        // -------------------------------------------------

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (authorizationService.isCurrentTechnician(
                    execution.getTechnicianId())) {

                return Optional.of(execution);
            }

            throw new AccessDeniedException(
                    "You are not allowed to access another technician's job"
            );
        }

        throw new AccessDeniedException(
                "You don't have permission to access this job execution"
        );
    }

    // =====================================================
    // GET BY SCHEDULE
    // =====================================================

    public Optional<JobExecution> getByScheduleId(
            Long scheduleId) {

        if (scheduleId == null) {
            throw new RuntimeException(
                    "Schedule ID is required"
            );
        }

        JobExecution execution =
                jobExecutionRepository
                        .findByScheduleId(scheduleId)
                        .orElse(null);

        if (execution == null) {
            return Optional.empty();
        }

        if (authorizationService.hasRole("DISPATCHER") ||
            authorizationService.hasRole("MANAGER")) {

            return Optional.of(execution);
        }

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (authorizationService.isCurrentTechnician(
                    execution.getTechnicianId())) {

                return Optional.of(execution);
            }

            throw new AccessDeniedException(
                    "You are not allowed to access another technician's job"
            );
        }

        throw new AccessDeniedException(
                "You don't have permission to access this job execution"
        );
    }

    // =====================================================
    // START JOB
    // =====================================================

    @Transactional
    public JobExecution startJob(
            JobExecution execution) {

        // -------------------------------------------------
        // REQUIRED FIELDS
        // -------------------------------------------------

        if (execution.getScheduleId() == null) {

            throw new RuntimeException(
                    "Schedule ID is required"
            );
        }

        if (execution.getWorkOrderId() == null) {

            throw new RuntimeException(
                    "Work Order ID is required"
            );
        }

        if (execution.getTechnicianId() == null) {

            throw new RuntimeException(
                    "Technician ID is required"
            );
        }

        // -------------------------------------------------
        // TECHNICIAN AUTHORIZATION
        // -------------------------------------------------

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (!authorizationService.isCurrentTechnician(
                    execution.getTechnicianId())) {

                throw new AccessDeniedException(
                        "You are not allowed to start a job for another technician"
                );
            }
        }

        // -------------------------------------------------
        // LOAD SCHEDULE
        // -------------------------------------------------

        Schedule schedule =
                scheduleRepository
                        .findById(execution.getScheduleId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Schedule not found with id: "
                                                + execution.getScheduleId()
                                )
                        );

        // -------------------------------------------------
        // VERIFY SCHEDULE → WORK ORDER
        // -------------------------------------------------

        if (!schedule.getWorkOrderId()
                .equals(execution.getWorkOrderId())) {

            throw new RuntimeException(
                    "Schedule does not belong to the specified work order"
            );
        }

        // -------------------------------------------------
        // VERIFY SCHEDULE → TECHNICIAN
        // -------------------------------------------------

        if (!schedule.getTechnicianId()
                .equals(execution.getTechnicianId())) {

            throw new RuntimeException(
                    "Schedule is assigned to a different technician"
            );
        }

        // -------------------------------------------------
        // LOAD WORK ORDER
        // -------------------------------------------------

        WorkOrder workOrder =
                workOrderRepository
                        .findById(execution.getWorkOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work Order not found with id: "
                                                + execution.getWorkOrderId()
                                )
                        );

        // -------------------------------------------------
        // VERIFY WORK ORDER → TECHNICIAN
        // -------------------------------------------------

        if (workOrder.getTechnicianId() == null ||
            !workOrder.getTechnicianId()
                    .equals(execution.getTechnicianId())) {

            throw new RuntimeException(
                    "Work order is assigned to a different technician"
            );
        }

        // -------------------------------------------------
        // WORK ORDER STATUS
        // -------------------------------------------------

        if (workOrder.getStatus() ==
                WorkOrder.Status.COMPLETED) {

            throw new RuntimeException(
                    "Completed work orders cannot be started"
            );
        }

        if (workOrder.getStatus() ==
                WorkOrder.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cancelled work orders cannot be started"
            );
        }

        if (workOrder.getStatus() ==
                WorkOrder.Status.IN_PROGRESS) {

            throw new RuntimeException(
                    "This work order is already in progress"
            );
        }

        // -------------------------------------------------
        // SCHEDULE STATUS
        // -------------------------------------------------

        if (schedule.getStatus() ==
                Schedule.Status.COMPLETED) {

            throw new RuntimeException(
                    "Completed schedules cannot be started"
            );
        }

        if (schedule.getStatus() ==
                Schedule.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cancelled schedules cannot be started"
            );
        }

        if (schedule.getStatus() ==
                Schedule.Status.IN_PROGRESS) {

            throw new RuntimeException(
                    "This schedule is already in progress"
            );
        }

        // -------------------------------------------------
        // PREVENT DUPLICATE EXECUTION
        // -------------------------------------------------

        if (jobExecutionRepository
                .existsByWorkOrderIdAndStatus(
                        execution.getWorkOrderId(),
                        JobExecution.Status.IN_PROGRESS)) {

            throw new RuntimeException(
                    "This work order already has an active job execution"
            );
        }

        // -------------------------------------------------
        // PREVENT SECOND EXECUTION FOR SAME SCHEDULE
        // -------------------------------------------------

        Optional<JobExecution> existingExecution =
                jobExecutionRepository
                        .findByScheduleId(
                                execution.getScheduleId()
                        );

        if (existingExecution.isPresent()) {

            JobExecution.Status existingStatus =
                    existingExecution.get().getStatus();

            if (existingStatus ==
                    JobExecution.Status.IN_PROGRESS) {

                throw new RuntimeException(
                        "This schedule already has an active job execution"
                );
            }

            if (existingStatus ==
                    JobExecution.Status.COMPLETED) {

                throw new RuntimeException(
                        "This schedule has already been completed"
                );
            }

            if (existingStatus ==
                    JobExecution.Status.CANCELLED) {

                throw new RuntimeException(
                        "This schedule has already been cancelled"
                );
            }
        }

        // -------------------------------------------------
        // START EXECUTION
        // -------------------------------------------------

        execution.setStatus(
                JobExecution.Status.IN_PROGRESS
        );

        execution.setStartedAt(
                LocalDateTime.now()
        );

        execution.setCompletedAt(null);

        // -------------------------------------------------
        // UPDATE SCHEDULE
        // -------------------------------------------------

        schedule.setStatus(
                Schedule.Status.IN_PROGRESS
        );

        scheduleRepository.save(schedule);

        // -------------------------------------------------
        // UPDATE WORK ORDER
        // -------------------------------------------------

        workOrder.setStatus(
                WorkOrder.Status.IN_PROGRESS
        );

        workOrderRepository.save(workOrder);

        // -------------------------------------------------
        // SAVE EXECUTION
        // -------------------------------------------------

        return jobExecutionRepository.save(execution);
    }

    // =====================================================
    // UPDATE EXECUTION
    // =====================================================

    public JobExecution updateExecution(
            Long id,
            JobExecution updatedExecution) {

        JobExecution existing =
                jobExecutionRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job execution not found with id: "
                                                + id
                                )
                        );

        // -------------------------------------------------
        // TECHNICIAN AUTHORIZATION
        // -------------------------------------------------

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (!authorizationService.isCurrentTechnician(
                    existing.getTechnicianId())) {

                throw new AccessDeniedException(
                        "You are not allowed to update another technician's job"
                );
            }
        }

        // -------------------------------------------------
        // ONLY ACTIVE EXECUTIONS CAN BE UPDATED
        // -------------------------------------------------

        if (existing.getStatus() ==
                JobExecution.Status.COMPLETED) {

            throw new RuntimeException(
                    "Completed job executions cannot be edited"
            );
        }

        if (existing.getStatus() ==
                JobExecution.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cancelled job executions cannot be edited"
            );
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

        return jobExecutionRepository.save(existing);
    }

    // =====================================================
    // COMPLETE JOB
    // =====================================================

    @Transactional
    public JobExecution completeJob(
            Long id,
            JobExecution updatedExecution) {

        JobExecution existing =
                jobExecutionRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job execution not found with id: "
                                                + id
                                )
                        );

        // -------------------------------------------------
        // TECHNICIAN AUTHORIZATION
        // -------------------------------------------------

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (!authorizationService.isCurrentTechnician(
                    existing.getTechnicianId())) {

                throw new AccessDeniedException(
                        "You are not allowed to complete another technician's job"
                );
            }
        }

        // -------------------------------------------------
        // EXECUTION MUST BE IN PROGRESS
        // -------------------------------------------------

        if (existing.getStatus() !=
                JobExecution.Status.IN_PROGRESS) {

            throw new RuntimeException(
                    "Only an IN_PROGRESS job can be completed"
            );
        }

        // -------------------------------------------------
        // LOAD WORK ORDER
        // -------------------------------------------------

        WorkOrder workOrder =
                workOrderRepository
                        .findById(existing.getWorkOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work Order not found with id: "
                                                + existing.getWorkOrderId()
                                )
                        );

        // -------------------------------------------------
        // LOAD SCHEDULE
        // -------------------------------------------------

        Schedule schedule =
                scheduleRepository
                        .findById(existing.getScheduleId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Schedule not found with id: "
                                                + existing.getScheduleId()
                                )
                        );

        // -------------------------------------------------
        // VERIFY RELATIONSHIPS
        // -------------------------------------------------

        if (!schedule.getWorkOrderId()
                .equals(existing.getWorkOrderId())) {

            throw new RuntimeException(
                    "Execution schedule does not belong to this work order"
            );
        }

        if (!schedule.getTechnicianId()
                .equals(existing.getTechnicianId())) {

            throw new RuntimeException(
                    "Execution technician does not match the schedule technician"
            );
        }

        if (workOrder.getTechnicianId() == null ||
            !workOrder.getTechnicianId()
                    .equals(existing.getTechnicianId())) {

            throw new RuntimeException(
                    "Execution technician does not match the work order technician"
            );
        }

        // -------------------------------------------------
        // COMPLETE EXECUTION
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
        // COMPLETE SCHEDULE
        // -------------------------------------------------

        schedule.setStatus(
                Schedule.Status.COMPLETED
        );

        scheduleRepository.save(schedule);

        // -------------------------------------------------
        // COMPLETE WORK ORDER
        // -------------------------------------------------

        workOrder.setStatus(
                WorkOrder.Status.COMPLETED
        );

        workOrder.setCompletedDate(
                LocalDateTime.now()
        );

        workOrderRepository.save(workOrder);

        // -------------------------------------------------
        // SAVE EXECUTION
        // -------------------------------------------------

        return jobExecutionRepository.save(existing);
    }

    // =====================================================
    // CANCEL JOB
    // =====================================================

    @Transactional
    public JobExecution cancelJob(Long id) {

        JobExecution execution =
                jobExecutionRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job execution not found with id: "
                                                + id
                                )
                        );

        // -------------------------------------------------
        // TECHNICIAN AUTHORIZATION
        // -------------------------------------------------

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (!authorizationService.isCurrentTechnician(
                    execution.getTechnicianId())) {

                throw new AccessDeniedException(
                        "You are not allowed to cancel another technician's job"
                );
            }
        }

        // -------------------------------------------------
        // PREVENT INVALID CANCELLATION
        // -------------------------------------------------

        if (execution.getStatus() ==
                JobExecution.Status.COMPLETED) {

            throw new RuntimeException(
                    "Completed job executions cannot be cancelled"
            );
        }

        if (execution.getStatus() ==
                JobExecution.Status.CANCELLED) {

            throw new RuntimeException(
                    "Job execution is already cancelled"
            );
        }

        // -------------------------------------------------
        // LOAD WORK ORDER
        // -------------------------------------------------

        WorkOrder workOrder =
                workOrderRepository
                        .findById(execution.getWorkOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work Order not found with id: "
                                                + execution.getWorkOrderId()
                                )
                        );

        // -------------------------------------------------
        // LOAD SCHEDULE
        // -------------------------------------------------

        Schedule schedule =
                scheduleRepository
                        .findById(execution.getScheduleId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Schedule not found with id: "
                                                + execution.getScheduleId()
                                )
                        );

        // -------------------------------------------------
        // VERIFY RELATIONSHIPS
        // -------------------------------------------------

        if (!schedule.getWorkOrderId()
                .equals(execution.getWorkOrderId())) {

            throw new RuntimeException(
                    "Execution schedule does not belong to this work order"
            );
        }

        if (!schedule.getTechnicianId()
                .equals(execution.getTechnicianId())) {

            throw new RuntimeException(
                    "Execution technician does not match the schedule technician"
            );
        }

        // -------------------------------------------------
        // CANCEL EXECUTION
        // -------------------------------------------------

        execution.setStatus(
                JobExecution.Status.CANCELLED
        );

        // -------------------------------------------------
        // CANCEL SCHEDULE
        // -------------------------------------------------

        schedule.setStatus(
                Schedule.Status.CANCELLED
        );

        scheduleRepository.save(schedule);

        // -------------------------------------------------
        // CANCEL WORK ORDER
        // -------------------------------------------------

        workOrder.setStatus(
                WorkOrder.Status.CANCELLED
        );

        workOrderRepository.save(workOrder);

        // -------------------------------------------------
        // SAVE EXECUTION
        // -------------------------------------------------

        return jobExecutionRepository.save(execution);
    }

    // =====================================================
    // BY TECHNICIAN
    // =====================================================

    public List<JobExecution> getByTechnician(
            Long technicianId) {

        if (technicianId == null) {

            throw new RuntimeException(
                    "Technician ID is required"
            );
        }

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (!authorizationService.isCurrentTechnician(
                    technicianId)) {

                throw new AccessDeniedException(
                        "You are not allowed to access another technician's job executions"
                );
            }

            return jobExecutionRepository
                    .findByTechnicianId(technicianId);
        }

        if (authorizationService.hasRole("DISPATCHER") ||
            authorizationService.hasRole("MANAGER")) {

            return jobExecutionRepository
                    .findByTechnicianId(technicianId);
        }

        throw new AccessDeniedException(
                "You don't have permission to access job executions"
        );
    }

    // =====================================================
    // BY WORK ORDER
    // =====================================================

    public List<JobExecution> getByWorkOrder(
            Long workOrderId) {

        if (workOrderId == null) {

            throw new RuntimeException(
                    "Work Order ID is required"
            );
        }

        if (authorizationService.hasRole("DISPATCHER") ||
            authorizationService.hasRole("MANAGER")) {

            return jobExecutionRepository
                    .findByWorkOrderId(workOrderId);
        }

        if (authorizationService.hasRole("TECHNICIAN")) {

            Long technicianId =
                    authorizationService.getCurrentTechnicianId();

            WorkOrder workOrder =
                    workOrderRepository
                            .findById(workOrderId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Work order not found with id: "
                                                    + workOrderId
                                    )
                            );

            if (workOrder.getTechnicianId() == null ||
                !workOrder.getTechnicianId().equals(technicianId)) {

                throw new AccessDeniedException(
                        "You are not allowed to access another technician's work order"
                );
            }

            return jobExecutionRepository
                    .findByWorkOrderId(workOrderId);
        }

        throw new AccessDeniedException(
                "You don't have permission to access these job executions"
        );
    }

    // =====================================================
    // BY STATUS
    // =====================================================

    public List<JobExecution> getByStatus(
            JobExecution.Status status) {

        if (status == null) {

            throw new RuntimeException(
                    "Status is required"
            );
        }

        if (authorizationService.hasRole("DISPATCHER") ||
            authorizationService.hasRole("MANAGER")) {

            return jobExecutionRepository
                    .findByStatus(status);
        }

        if (authorizationService.hasRole("TECHNICIAN")) {

            Long technicianId =
                    authorizationService.getCurrentTechnicianId();

            return jobExecutionRepository
                    .findByStatus(status)
                    .stream()
                    .filter(execution ->
                            execution.getTechnicianId() != null &&
                            execution.getTechnicianId()
                                    .equals(technicianId))
                    .toList();
        }

        throw new AccessDeniedException(
                "You don't have permission to access job executions"
        );
    }
}