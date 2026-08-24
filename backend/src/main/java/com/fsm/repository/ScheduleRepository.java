package com.fsm.repository;

import com.fsm.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByTechnicianId(Long technicianId);

    List<Schedule> findByWorkOrderId(Long workOrderId);

    List<Schedule> findByScheduledDate(LocalDate scheduledDate);

    List<Schedule> findByStatus(Schedule.Status status);
}