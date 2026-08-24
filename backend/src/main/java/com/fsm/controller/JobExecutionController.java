package com.fsm.controller;

import com.fsm.entity.JobExecution;
import com.fsm.service.JobExecutionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-executions")
@CrossOrigin(origins = "http://localhost:5173")
public class JobExecutionController {

    private final JobExecutionService jobExecutionService;


    public JobExecutionController(
            JobExecutionService jobExecutionService) {

        this.jobExecutionService = jobExecutionService;
    }


    // -----------------------------------------
    // GET ALL
    // -----------------------------------------

    @GetMapping
    public ResponseEntity<List<JobExecution>>
    getAllExecutions() {

        return ResponseEntity.ok(
                jobExecutionService.getAllExecutions()
        );
    }


    // -----------------------------------------
    // GET BY ID
    // -----------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<JobExecution>
    getExecutionById(
            @PathVariable Long id) {

        return jobExecutionService
                .getExecutionById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }


    // -----------------------------------------
    // GET BY SCHEDULE
    // -----------------------------------------

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<JobExecution>
    getByScheduleId(
            @PathVariable Long scheduleId) {

        return jobExecutionService
                .getByScheduleId(scheduleId)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }


    // -----------------------------------------
    // START JOB
    // -----------------------------------------

    @PostMapping("/start")
    public ResponseEntity<JobExecution>
    startJob(
            @RequestBody JobExecution execution) {

        JobExecution startedJob =
                jobExecutionService.startJob(
                        execution
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(startedJob);
    }


    // -----------------------------------------
    // UPDATE JOB
    // -----------------------------------------

    @PutMapping("/{id}")
    public ResponseEntity<JobExecution>
    updateExecution(
            @PathVariable Long id,
            @RequestBody JobExecution execution) {

        return ResponseEntity.ok(
                jobExecutionService.updateExecution(
                        id,
                        execution
                )
        );
    }


    // -----------------------------------------
    // COMPLETE JOB
    // -----------------------------------------

    @PutMapping("/{id}/complete")
    public ResponseEntity<JobExecution>
    completeJob(
            @PathVariable Long id,
            @RequestBody JobExecution execution) {

        return ResponseEntity.ok(
                jobExecutionService.completeJob(
                        id,
                        execution
                )
        );
    }


    // -----------------------------------------
    // CANCEL JOB
    // -----------------------------------------

    @PutMapping("/{id}/cancel")
    public ResponseEntity<JobExecution>
    cancelJob(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                jobExecutionService.cancelJob(id)
        );
    }


    // -----------------------------------------
    // BY TECHNICIAN
    // -----------------------------------------

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<JobExecution>>
    getByTechnician(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                jobExecutionService.getByTechnician(
                        technicianId
                )
            );
    }


    // -----------------------------------------
    // BY WORK ORDER
    // -----------------------------------------

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<JobExecution>>
    getByWorkOrder(
            @PathVariable Long workOrderId) {

        return ResponseEntity.ok(
                jobExecutionService.getByWorkOrder(
                        workOrderId
                )
            );
    }


    // -----------------------------------------
    // BY STATUS
    // -----------------------------------------

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobExecution>>
    getByStatus(
            @PathVariable JobExecution.Status status) {

        return ResponseEntity.ok(
                jobExecutionService.getByStatus(
                        status
                )
            );
    }
}