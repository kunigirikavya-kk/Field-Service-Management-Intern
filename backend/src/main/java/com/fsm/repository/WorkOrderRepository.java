package com.fsm.repository;

import com.fsm.entity.WorkOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface WorkOrderRepository
        extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findByCustomerId(
            Long customerId
    );

    Page<WorkOrder> findByCustomerId(Long customerId, Pageable pageable);

    List<WorkOrder> findByTechnicianId(
            Long technicianId
    );

    Page<WorkOrder> findByTechnicianId(Long technicianId, Pageable pageable);

    List<WorkOrder> findByStatus(
            WorkOrder.Status status
    );

    Page<WorkOrder> findByStatus(WorkOrder.Status status, Pageable pageable);

    List<WorkOrder> findByCustomerIdAndStatus(
            Long customerId,
            WorkOrder.Status status
    );

    Page<WorkOrder> findByCustomerIdAndStatus(Long customerId, WorkOrder.Status status, Pageable pageable);

    Page<WorkOrder> findByTechnicianIdAndStatus(Long technicianId, WorkOrder.Status status, Pageable pageable);

    boolean existsByOrderNumber(
            String orderNumber
    );
}