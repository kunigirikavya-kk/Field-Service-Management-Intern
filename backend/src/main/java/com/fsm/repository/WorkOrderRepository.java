// WorkOrderRepository.java

package com.fsm.repository;

import com.fsm.entity.WorkOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository
        extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findByCustomerId(
            Long customerId
    );

    List<WorkOrder> findByTechnicianId(
            Long technicianId
    );

    List<WorkOrder> findByStatus(
            WorkOrder.Status status
    );

    List<WorkOrder> findByCustomerIdAndStatus(
            Long customerId,
            WorkOrder.Status status
    );
}