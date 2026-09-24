package com.fsm.repository;
import com.fsm.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByWorkOrderIdOrderByLoggedAtAsc(Long workOrderId);
    List<TimeLog> findByTechnicianIdOrderByLoggedAtDesc(Long technicianId);
}