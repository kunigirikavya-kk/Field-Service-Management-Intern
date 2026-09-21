package com.fsm.repository;

import com.fsm.entity.Schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ScheduleRepository
        extends JpaRepository<Schedule, Long> {

    // =====================================================
    // FIND BY TECHNICIAN
    // =====================================================

    List<Schedule> findByTechnicianId(
            Long technicianId
    );

    // =====================================================
    // FIND BY WORK ORDER
    // =====================================================

    List<Schedule> findByWorkOrderId(
            Long workOrderId
    );

    // =====================================================
    // CHECK WHETHER A WORK ORDER ALREADY HAS A SCHEDULE
    // =====================================================

    boolean existsByWorkOrderId(
            Long workOrderId
    );

    // =====================================================
    // FIND BY DATE
    // =====================================================

    List<Schedule> findByScheduledDate(
            LocalDate scheduledDate
    );

    // =====================================================
    // FIND BY STATUS
    // =====================================================

    List<Schedule> findByStatus(
            Schedule.Status status
    );

    // =====================================================
    // CHECK TECHNICIAN SCHEDULE OVERLAP
    // =====================================================

    List<Schedule>
    findByTechnicianIdAndScheduledDateAndStartTimeLessThanAndEndTimeGreaterThan(
            Long technicianId,
            LocalDate scheduledDate,
            LocalTime endTime,
            LocalTime startTime
    );

    // =====================================================
    // CHECK TECHNICIAN SCHEDULE OVERLAP DURING UPDATE
    // =====================================================

    List<Schedule>
    findByTechnicianIdAndScheduledDateAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
            Long technicianId,
            LocalDate scheduledDate,
            LocalTime endTime,
            LocalTime startTime,
            Long id
    );
}