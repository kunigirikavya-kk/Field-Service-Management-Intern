package com.fsm.repository;
import com.fsm.entity.WorkOrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface WorkOrderStatusHistoryRepository extends JpaRepository<WorkOrderStatusHistory, Long> {
    List<WorkOrderStatusHistory> findByWorkOrderIdOrderByChangedAtAsc(Long workOrderId);
}