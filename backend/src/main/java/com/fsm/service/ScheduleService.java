package com.fsm.service;

import com.fsm.entity.Schedule;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.ScheduleRepository;
import com.fsm.repository.WorkOrderRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final WorkOrderRepository workOrderRepository;


    public ScheduleService(
            ScheduleRepository scheduleRepository,
            WorkOrderRepository workOrderRepository) {

        this.scheduleRepository = scheduleRepository;
        this.workOrderRepository = workOrderRepository;
    }


    // ==============================
    // GET ALL SCHEDULES
    // ==============================

    public List<Schedule> getAllSchedules() {

        return scheduleRepository.findAll();
    }


    // ==============================
    // GET SCHEDULE BY ID
    // ==============================

    public Optional<Schedule> getScheduleById(Long id) {

        return scheduleRepository.findById(id);
    }


    // ==============================
    // CREATE SCHEDULE
    // ==============================

    public Schedule createSchedule(Schedule schedule) {

        // Validate Work Order
        if (schedule.getWorkOrderId() == null) {

            throw new RuntimeException(
                    "Work Order is required"
            );
        }


        if (!workOrderRepository.existsById(
                schedule.getWorkOrderId())) {

            throw new RuntimeException(
                    "Work Order not found with id: "
                    + schedule.getWorkOrderId()
            );
        }


        // Validate Technician
        if (schedule.getTechnicianId() == null) {

            throw new RuntimeException(
                    "Technician is required"
            );
        }


        // Validate date
        if (schedule.getScheduledDate() == null) {

            throw new RuntimeException(
                    "Scheduled date is required"
            );
        }


        // Validate time
        if (schedule.getStartTime() == null ||
                schedule.getEndTime() == null) {

            throw new RuntimeException(
                    "Start time and end time are required"
            );
        }


        // End time must be after start time
        if (!schedule.getStartTime()
                .isBefore(schedule.getEndTime())) {

            throw new RuntimeException(
                    "End time must be after start time"
            );
        }


        // Default status
        if (schedule.getStatus() == null) {

            schedule.setStatus(
                    Schedule.Status.SCHEDULED
            );
        }


        // Save schedule
        Schedule savedSchedule =
                scheduleRepository.save(schedule);


        // ==============================
        // UPDATE WORK ORDER
        // ==============================

        WorkOrder workOrder =
                workOrderRepository
                        .findById(
                                schedule.getWorkOrderId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work Order not found"
                                )
                        );


        // Assign technician to work order
        workOrder.setTechnicianId(
                schedule.getTechnicianId()
        );


        // Change status to ASSIGNED
        if (workOrder.getStatus() ==
                WorkOrder.Status.PENDING) {

            workOrder.setStatus(
                    WorkOrder.Status.ASSIGNED
            );
        }


        workOrderRepository.save(workOrder);


        return savedSchedule;
    }


    // ==============================
    // UPDATE SCHEDULE
    // ==============================

    public Schedule updateSchedule(
            Long id,
            Schedule updatedSchedule) {

        Schedule existingSchedule =
                scheduleRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Schedule not found with id: "
                                        + id
                                )
                        );


        existingSchedule.setWorkOrderId(
                updatedSchedule.getWorkOrderId()
        );

        existingSchedule.setTechnicianId(
                updatedSchedule.getTechnicianId()
        );

        existingSchedule.setScheduledDate(
                updatedSchedule.getScheduledDate()
        );

        existingSchedule.setStartTime(
                updatedSchedule.getStartTime()
        );

        existingSchedule.setEndTime(
                updatedSchedule.getEndTime()
        );

        existingSchedule.setStatus(
                updatedSchedule.getStatus()
        );

        existingSchedule.setNotes(
                updatedSchedule.getNotes()
        );


        return scheduleRepository.save(
                existingSchedule
        );
    }


    // ==============================
    // DELETE SCHEDULE
    // ==============================

    public void deleteSchedule(Long id) {

        if (!scheduleRepository.existsById(id)) {

            throw new RuntimeException(
                    "Schedule not found with id: " + id
            );
        }

        scheduleRepository.deleteById(id);
    }


    // ==============================
    // BY TECHNICIAN
    // ==============================

    public List<Schedule> getSchedulesByTechnician(
            Long technicianId) {

        return scheduleRepository
                .findByTechnicianId(technicianId);
    }


    // ==============================
    // BY WORK ORDER
    // ==============================

    public List<Schedule> getSchedulesByWorkOrder(
            Long workOrderId) {

        return scheduleRepository
                .findByWorkOrderId(workOrderId);
    }


    // ==============================
    // BY DATE
    // ==============================

    public List<Schedule> getSchedulesByDate(
            LocalDate date) {

        return scheduleRepository
                .findByScheduledDate(date);
    }


    // ==============================
    // BY STATUS
    // ==============================

    public List<Schedule> getSchedulesByStatus(
            Schedule.Status status) {

        return scheduleRepository
                .findByStatus(status);
    }
}