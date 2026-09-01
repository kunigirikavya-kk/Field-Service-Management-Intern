
package com.fsm.controller;

import com.fsm.entity.Schedule;
import com.fsm.service.ScheduleService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(
        origins = "http://localhost:5174"
)
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(
            ScheduleService scheduleService) {

        this.scheduleService =
                scheduleService;
    }

    // =====================================================
    // GET ALL SCHEDULES
    // DISPATCHER / MANAGER
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Schedule>>
    getAllSchedules() {

        return ResponseEntity.ok(
                scheduleService
                        .getAllSchedules()
        );
    }

    // =====================================================
    // GET SCHEDULE BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Schedule>
    getScheduleById(
            @PathVariable Long id) {

        return scheduleService
                .getScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =====================================================
    // CREATE SCHEDULE
    // DISPATCHER / MANAGER
    // =====================================================

    @PostMapping
    public ResponseEntity<Schedule>
    createSchedule(
            @RequestBody Schedule schedule) {

        Schedule createdSchedule =
                scheduleService
                        .createSchedule(
                                schedule
                        );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        createdSchedule
                );
    }

    // =====================================================
    // UPDATE SCHEDULE
    // DISPATCHER / MANAGER
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Schedule>
    updateSchedule(
            @PathVariable Long id,
            @RequestBody Schedule schedule) {

        return ResponseEntity.ok(
                scheduleService
                        .updateSchedule(
                                id,
                                schedule
                        )
        );
    }

    // =====================================================
    // DELETE SCHEDULE
    // DISPATCHER / MANAGER
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteSchedule(
            @PathVariable Long id) {

        scheduleService
                .deleteSchedule(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    // =====================================================
    // BY TECHNICIAN
    // =====================================================

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<Schedule>>
    getByTechnician(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                scheduleService
                        .getSchedulesByTechnician(
                                technicianId
                        )
        );
    }

    // =====================================================
    // BY WORK ORDER
    // =====================================================

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<Schedule>>
    getByWorkOrder(
            @PathVariable Long workOrderId) {

        return ResponseEntity.ok(
                scheduleService
                        .getSchedulesByWorkOrder(
                                workOrderId
                        )
        );
    }

    // =====================================================
    // BY DATE
    // =====================================================

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Schedule>>
    getByDate(
            @PathVariable String date) {

        LocalDate scheduledDate =
                LocalDate.parse(date);

        return ResponseEntity.ok(
                scheduleService
                        .getSchedulesByDate(
                                scheduledDate
                        )
        );
    }

    // =====================================================
    // BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Schedule>>
    getByStatus(
            @PathVariable Schedule.Status status) {

        return ResponseEntity.ok(
                scheduleService
                        .getSchedulesByStatus(
                                status
                        )
        );
    }
}

