package com.fsm.repository;

import com.fsm.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository
        extends JpaRepository<Schedule, Long> {

    List<Schedule> findByTechnicianId(
            Long technicianId
    );

    List<Schedule> findByWorkOrderId(
            Long workOrderId
    );

    List<Schedule> findByScheduledDate(
            LocalDate scheduledDate
    );

    List<Schedule> findByStatus(
            Schedule.Status status
    );
}