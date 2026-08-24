package com.fsm.service;

import com.fsm.entity.JobExecution;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.JobExecutionRepository;
import com.fsm.repository.WorkOrderRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobExecutionService {

    private final JobExecutionRepository jobExecutionRepository;
    private final WorkOrderRepository workOrderRepository;


    // -----------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------

    public JobExecutionService(
            JobExecutionRepository jobExecutionRepository,
            WorkOrderRepository workOrderRepository) {

        this.jobExecutionRepository = jobExecutionRepository;
        this.workOrderRepository = workOrderRepository;
    }


    // -----------------------------------------
    // GET ALL EXECUTIONS
    // -----------------------------------------

    public List<JobExecution> getAllExecutions() {

        return jobExecutionRepository.findAll();
    }


    // -----------------------------------------
    // GET BY ID
    // -----------------------------------------

    public Optional<JobExecution> getExecutionById(Long id) {

        return jobExecutionRepository.findById(id);
    }


    // -----------------------------------------
    // GET BY SCHEDULE
    // -----------------------------------------

    public Optional<JobExecution> getByScheduleId(
            Long scheduleId) {

        return jobExecutionRepository
                .findByScheduleId(scheduleId);
    }


    // -----------------------------------------
    // START JOB
    // -----------------------------------------

    public JobExecution startJob(
            JobExecution execution) {

        // Set Job Execution status
        execution.setStatus(
                JobExecution.Status.IN_PROGRESS
        );

        // Set start time
        execution.setStartedAt(
                LocalDateTime.now()
        );

        // Clear completed time
        execution.setCompletedAt(null);


        // -----------------------------------------
        // UPDATE WORK ORDER STATUS
        // -----------------------------------------

        WorkOrder workOrder =
                workOrderRepository.findById(
                        execution.getWorkOrderId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Work Order not found with id: "
                                        + execution.getWorkOrderId()
                        )
                );


        workOrder.setStatus(
                WorkOrder.Status.IN_PROGRESS
        );


        workOrderRepository.save(workOrder);


        // Save Job Execution
        return jobExecutionRepository.save(execution);
    }


    // -----------------------------------------
    // UPDATE JOB
    // -----------------------------------------

    public JobExecution updateExecution(
            Long id,
            JobExecution updatedExecution) {

        JobExecution existing =
                jobExecutionRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Job execution not found with id: "
                                                + id
                                )
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


        return jobExecutionRepository.save(existing);
    }


    // -----------------------------------------
    // COMPLETE JOB
    // -----------------------------------------

    public JobExecution completeJob(
            Long id,
            JobExecution updatedExecution) {

        JobExecution existing =
                jobExecutionRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Job execution not found with id: "
                                                + id
                                )
                        );


        // -----------------------------------------
        // UPDATE JOB EXECUTION
        // -----------------------------------------

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


        // -----------------------------------------
        // UPDATE WORK ORDER
        // -----------------------------------------

        WorkOrder workOrder =
                workOrderRepository.findById(
                        existing.getWorkOrderId()
                ).orElseThrow(
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


        workOrderRepository.save(workOrder);


        // Save Job Execution
        return jobExecutionRepository.save(existing);
    }


    // -----------------------------------------
    // CANCEL JOB
    // -----------------------------------------

    public JobExecution cancelJob(Long id) {

        JobExecution execution =
                jobExecutionRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Job execution not found with id: "
                                                + id
                                )
                        );


        // -----------------------------------------
        // UPDATE JOB EXECUTION
        // -----------------------------------------

        execution.setStatus(
                JobExecution.Status.CANCELLED
        );


        // -----------------------------------------
        // UPDATE WORK ORDER
        // -----------------------------------------

        WorkOrder workOrder =
                workOrderRepository.findById(
                        execution.getWorkOrderId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Work Order not found with id: "
                                        + execution.getWorkOrderId()
                        )
                );


        workOrder.setStatus(
                WorkOrder.Status.CANCELLED
        );


        workOrderRepository.save(workOrder);


        // Save Job Execution
        return jobExecutionRepository.save(execution);
    }


    // -----------------------------------------
    // TECHNICIAN JOBS
    // -----------------------------------------

    public List<JobExecution> getByTechnician(
            Long technicianId) {

        return jobExecutionRepository
                .findByTechnicianId(technicianId);
    }


    // -----------------------------------------
    // WORK ORDER JOBS
    // -----------------------------------------

    public List<JobExecution> getByWorkOrder(
            Long workOrderId) {

        return jobExecutionRepository
                .findByWorkOrderId(workOrderId);
    }


    // -----------------------------------------
    // STATUS
    // -----------------------------------------

    public List<JobExecution> getByStatus(
            JobExecution.Status status) {

        return jobExecutionRepository
                .findByStatus(status);
    }
}