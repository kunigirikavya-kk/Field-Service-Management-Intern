
package com.fsm.service;

import com.fsm.entity.Schedule;
import com.fsm.entity.Technician;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.ScheduleRepository;
import com.fsm.repository.TechnicianRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final WorkOrderRepository workOrderRepository;
    private final TechnicianRepository technicianRepository;
    private final AuthorizationService authorizationService;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            WorkOrderRepository workOrderRepository,
            TechnicianRepository technicianRepository,
            AuthorizationService authorizationService) {

        this.scheduleRepository =
                scheduleRepository;

        this.workOrderRepository =
                workOrderRepository;

        this.technicianRepository =
                technicianRepository;

        this.authorizationService =
                authorizationService;
    }

    // =====================================================
    // GET ALL SCHEDULES
    // =====================================================

    public List<Schedule> getAllSchedules() {

    if (authorizationService.hasRole("TECHNICIAN")) {

        Long technicianId =
                authorizationService
                        .getCurrentTechnicianId();

        return scheduleRepository
                .findByTechnicianId(technicianId);
    }

    if (
            authorizationService.hasRole("DISPATCHER") ||
            authorizationService.hasRole("MANAGER")
    ) {

        return scheduleRepository.findAll();
    }

    throw new AccessDeniedException(
            "You don't have permission to access schedules"
    );
}
    // =====================================================
    // GET SCHEDULE BY ID
    // =====================================================

    public Optional<Schedule> getScheduleById(
            Long id) {

        return scheduleRepository.findById(id);
    }

    // =====================================================
    // CREATE SCHEDULE
    // =====================================================

    public Schedule createSchedule(
            Schedule schedule) {

        // -------------------------------------------------
        // ONLY DISPATCHER / MANAGER
        // -------------------------------------------------

        if (
                !authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")
        ) {

            throw new AccessDeniedException(
                    "Only Dispatcher or Manager can create schedules"
            );
        }

        // -------------------------------------------------
        // WORK ORDER VALIDATION
        // -------------------------------------------------

        if (schedule.getWorkOrderId() == null) {

            throw new RuntimeException(
                    "Work Order is required"
            );
        }

        WorkOrder workOrder =
                workOrderRepository
                        .findById(
                                schedule.getWorkOrderId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work Order not found with id: "
                                                + schedule.getWorkOrderId()
                                )
                        );

        // -------------------------------------------------
        // TECHNICIAN VALIDATION
        // -------------------------------------------------

        if (schedule.getTechnicianId() == null) {

            throw new RuntimeException(
                    "Technician is required"
            );
        }

        Technician technician =
                technicianRepository
                        .findById(
                                schedule.getTechnicianId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found with id: "
                                                + schedule.getTechnicianId()
                                )
                        );

        // -------------------------------------------------
        // TECHNICIAN STATUS
        // -------------------------------------------------

        if (
                technician.getStatus() == null ||
                !"AVAILABLE".equalsIgnoreCase(
                        technician.getStatus()
                )
        ) {

            throw new RuntimeException(
                    "Technician "
                            + technician.getFullName()
                            + " is not available"
            );
        }

        // -------------------------------------------------
        // DATE VALIDATION
        // -------------------------------------------------

        if (schedule.getScheduledDate() == null) {

            throw new RuntimeException(
                    "Scheduled date is required"
            );
        }

        // -------------------------------------------------
        // TIME VALIDATION
        // -------------------------------------------------

        if (
                schedule.getStartTime() == null ||
                schedule.getEndTime() == null
        ) {

            throw new RuntimeException(
                    "Start time and end time are required"
            );
        }

        if (
                !schedule.getStartTime()
                        .isBefore(
                                schedule.getEndTime()
                        )
        ) {

            throw new RuntimeException(
                    "End time must be after start time"
            );
        }

        // -------------------------------------------------
        // OVERLAPPING SCHEDULE CHECK
        // -------------------------------------------------

        List<Schedule> overlappingSchedules =
                scheduleRepository
                        .findByTechnicianIdAndScheduledDateAndStartTimeLessThanAndEndTimeGreaterThan(
                                schedule.getTechnicianId(),
                                schedule.getScheduledDate(),
                                schedule.getEndTime(),
                                schedule.getStartTime()
                        );

        if (!overlappingSchedules.isEmpty()) {

            throw new RuntimeException(
                    "Technician already has a schedule during this time"
            );
        }

        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (schedule.getStatus() == null) {

            schedule.setStatus(
                    Schedule.Status.SCHEDULED
            );
        }

        // -------------------------------------------------
        // SAVE SCHEDULE
        // -------------------------------------------------

        Schedule savedSchedule =
                scheduleRepository.save(
                        schedule
                );

        // -------------------------------------------------
        // ASSIGN TECHNICIAN TO WORK ORDER
        // -------------------------------------------------

        workOrder.setTechnicianId(
                schedule.getTechnicianId()
        );

        if (
                workOrder.getStatus() ==
                        WorkOrder.Status.PENDING
        ) {

            workOrder.setStatus(
                    WorkOrder.Status.ASSIGNED
            );
        }

        workOrderRepository.save(
                workOrder
        );

        return savedSchedule;
    }

    // =====================================================
    // UPDATE SCHEDULE
    // =====================================================

    public Schedule updateSchedule(
            Long id,
            Schedule updatedSchedule) {

        // -------------------------------------------------
        // ONLY DISPATCHER / MANAGER
        // -------------------------------------------------

        if (
                !authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")
        ) {

            throw new AccessDeniedException(
                    "Only Dispatcher or Manager can update schedules"
            );
        }

        // -------------------------------------------------
        // EXISTING SCHEDULE
        // -------------------------------------------------

        Schedule existingSchedule =
                scheduleRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Schedule not found with id: "
                                                + id
                                )
                        );

        // -------------------------------------------------
        // VALIDATE WORK ORDER
        // -------------------------------------------------

        if (
                updatedSchedule.getWorkOrderId() == null
        ) {

            throw new RuntimeException(
                    "Work Order is required"
            );
        }

        WorkOrder workOrder =
                workOrderRepository
                        .findById(
                                updatedSchedule
                                        .getWorkOrderId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work Order not found with id: "
                                                + updatedSchedule
                                                .getWorkOrderId()
                                )
                        );

        // -------------------------------------------------
        // VALIDATE TECHNICIAN
        // -------------------------------------------------

        if (
                updatedSchedule.getTechnicianId() == null
        ) {

            throw new RuntimeException(
                    "Technician is required"
            );
        }

        Technician technician =
                technicianRepository
                        .findById(
                                updatedSchedule
                                        .getTechnicianId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found with id: "
                                                + updatedSchedule
                                                .getTechnicianId()
                                )
                        );

        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        if (
                updatedSchedule.getScheduledDate()
                        == null
        ) {

            throw new RuntimeException(
                    "Scheduled date is required"
            );
        }

        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        if (
                updatedSchedule.getStartTime() == null ||
                updatedSchedule.getEndTime() == null
        ) {

            throw new RuntimeException(
                    "Start time and end time are required"
            );
        }

        if (
                !updatedSchedule.getStartTime()
                        .isBefore(
                                updatedSchedule.getEndTime()
                        )
        ) {

            throw new RuntimeException(
                    "End time must be after start time"
            );
        }

        // -------------------------------------------------
        // TECHNICIAN AVAILABILITY
        // -------------------------------------------------

        /*
         * Allow the technician who is already assigned
         * to this schedule even if their status changed
         * to BUSY because of this schedule.
         */

        boolean technicianChanged =
                !existingSchedule
                        .getTechnicianId()
                        .equals(
                                updatedSchedule
                                        .getTechnicianId()
                        );

        if (
                technicianChanged &&
                (
                        technician.getStatus() == null ||
                        !"AVAILABLE".equalsIgnoreCase(
                                technician.getStatus()
                        )
                )
        ) {

            throw new RuntimeException(
                    "Technician "
                            + technician.getFullName()
                            + " is not available"
            );
        }

        // -------------------------------------------------
        // OVERLAP CHECK
        // -------------------------------------------------

        List<Schedule> overlappingSchedules =
                scheduleRepository
                        .findByTechnicianIdAndScheduledDateAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                                updatedSchedule
                                        .getTechnicianId(),
                                updatedSchedule
                                        .getScheduledDate(),
                                updatedSchedule
                                        .getEndTime(),
                                updatedSchedule
                                        .getStartTime(),
                                id
                        );

        if (!overlappingSchedules.isEmpty()) {

            throw new RuntimeException(
                    "Technician already has another schedule during this time"
            );
        }

        // -------------------------------------------------
        // UPDATE FIELDS
        // -------------------------------------------------

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

        if (updatedSchedule.getStatus() != null) {

            existingSchedule.setStatus(
                    updatedSchedule.getStatus()
            );
        }

        existingSchedule.setNotes(
                updatedSchedule.getNotes()
        );

        // -------------------------------------------------
        // SAVE SCHEDULE
        // -------------------------------------------------

        Schedule savedSchedule =
                scheduleRepository.save(
                        existingSchedule
                );

        // -------------------------------------------------
        // UPDATE WORK ORDER
        // -------------------------------------------------

        workOrder.setTechnicianId(
                updatedSchedule.getTechnicianId()
        );

        if (
                workOrder.getStatus() ==
                        WorkOrder.Status.PENDING
        ) {

            workOrder.setStatus(
                    WorkOrder.Status.ASSIGNED
            );
        }

        workOrderRepository.save(
                workOrder
        );

        return savedSchedule;
    }

    // =====================================================
    // DELETE SCHEDULE
    // =====================================================

    public void deleteSchedule(Long id) {

        if (
                !authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")
        ) {

            throw new AccessDeniedException(
                    "Only Dispatcher or Manager can delete schedules"
            );
        }

        if (
                !scheduleRepository.existsById(id)
        ) {

            throw new RuntimeException(
                    "Schedule not found with id: "
                            + id
            );
        }

        scheduleRepository.deleteById(id);
    }

    // =====================================================
    // BY TECHNICIAN
    // =====================================================

    public List<Schedule> getSchedulesByTechnician(
            Long technicianId) {

        if (technicianId == null) {

            throw new RuntimeException(
                    "Technician ID is required"
            );
        }

        // -------------------------------------------------
        // TECHNICIAN CAN ONLY SEE THEIR OWN SCHEDULES
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
                        "You are not allowed to access another technician's schedules"
                );
            }

            return scheduleRepository
                    .findByTechnicianId(
                            technicianId
                    );
        }

        // -------------------------------------------------
        // DISPATCHER / MANAGER
        // -------------------------------------------------

        if (
                authorizationService.hasRole(
                        "DISPATCHER"
                ) ||
                authorizationService.hasRole(
                        "MANAGER"
                )
        ) {

            return scheduleRepository
                    .findByTechnicianId(
                            technicianId
                    );
        }

        throw new AccessDeniedException(
                "You don't have permission to access these schedules"
        );
    }

    // =====================================================
    // BY WORK ORDER
    // =====================================================

    public List<Schedule> getSchedulesByWorkOrder(
            Long workOrderId) {

        if (workOrderId == null) {

            throw new RuntimeException(
                    "Work Order ID is required"
            );
        }

        return scheduleRepository
                .findByWorkOrderId(
                        workOrderId
                );
    }

    // =====================================================
    // BY DATE
    // =====================================================

    public List<Schedule> getSchedulesByDate(
            LocalDate date) {

        if (date == null) {

            throw new RuntimeException(
                    "Date is required"
            );
        }

        return scheduleRepository
                .findByScheduledDate(
                        date
                );
    }

    // =====================================================
    // BY STATUS
    // =====================================================

    public List<Schedule> getSchedulesByStatus(
            Schedule.Status status) {

        if (status == null) {

            throw new RuntimeException(
                    "Status is required"
            );
        }

        return scheduleRepository
                .findByStatus(
                        status
                );
    }
}

