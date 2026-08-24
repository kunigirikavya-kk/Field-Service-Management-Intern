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
@CrossOrigin(origins = "http://localhost:5173")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }


    // GET all schedules
    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }


    // GET schedule by ID
    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getScheduleById(@PathVariable Long id) {

        return scheduleService.getScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // CREATE schedule
    @PostMapping
    public ResponseEntity<Schedule> createSchedule(
            @RequestBody Schedule schedule) {

        Schedule createdSchedule =
                scheduleService.createSchedule(schedule);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdSchedule);
    }


    // UPDATE schedule
    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(
            @PathVariable Long id,
            @RequestBody Schedule schedule) {

        return ResponseEntity.ok(
                scheduleService.updateSchedule(id, schedule)
        );
    }


    // DELETE schedule
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long id) {

        scheduleService.deleteSchedule(id);

        return ResponseEntity.noContent().build();
    }


    // GET schedules by technician
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<Schedule>> getByTechnician(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                scheduleService.getSchedulesByTechnician(technicianId)
        );
    }


    // GET schedules by work order
    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<Schedule>> getByWorkOrder(
            @PathVariable Long workOrderId) {

        return ResponseEntity.ok(
                scheduleService.getSchedulesByWorkOrder(workOrderId)
        );
    }


    // GET schedules by date
    @GetMapping("/date/{date}")
    public ResponseEntity<List<Schedule>> getByDate(
            @PathVariable String date) {

        LocalDate scheduledDate = LocalDate.parse(date);

        return ResponseEntity.ok(
                scheduleService.getSchedulesByDate(scheduledDate)
        );
    }


    // GET schedules by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Schedule>> getByStatus(
            @PathVariable Schedule.Status status) {

        return ResponseEntity.ok(
                scheduleService.getSchedulesByStatus(status)
        );
    }
}