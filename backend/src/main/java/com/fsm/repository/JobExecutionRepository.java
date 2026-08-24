package com.fsm.repository;

import com.fsm.entity.JobExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobExecutionRepository
        extends JpaRepository<JobExecution, Long> {

    Optional<JobExecution> findByScheduleId(Long scheduleId);

    List<JobExecution> findByTechnicianId(Long technicianId);

    List<JobExecution> findByWorkOrderId(Long workOrderId);

    List<JobExecution> findByStatus(JobExecution.Status status);
}