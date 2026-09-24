package com.fsm.service;

import com.fsm.entity.TimeLog;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.TimeLogRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TimeLogService {
    private final TimeLogRepository timeLogRepository;
    private final WorkOrderRepository workOrderRepository;
    private final AuthorizationService authorizationService;

    public TimeLogService(TimeLogRepository timeLogRepository, WorkOrderRepository workOrderRepository, AuthorizationService authorizationService) {
        this.timeLogRepository = timeLogRepository;
        this.workOrderRepository = workOrderRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional
    public TimeLog log(TimeLog input) {
        if (input.getWorkOrderId() == null || input.getTechnicianId() == null) throw new IllegalArgumentException("Work order and technician are required");
        if (input.getMinutes() == null || input.getMinutes() <= 0) throw new IllegalArgumentException("Minutes must be greater than zero");

        WorkOrder order = workOrderRepository.findById(input.getWorkOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Work order not found"));

        if (order.getStatus() == WorkOrder.Status.CLOSED || order.getStatus() == WorkOrder.Status.CANCELLED)
            throw new IllegalStateException("Time cannot be logged on a closed or cancelled work order");

        if (authorizationService.hasRole("TECHNICIAN") && !authorizationService.isCurrentTechnician(input.getTechnicianId()))
            throw new AccessDeniedException("You can only log time for your own work");

        if (order.getTechnicianId() == null || !order.getTechnicianId().equals(input.getTechnicianId()))
            throw new AccessDeniedException("Time can only be logged by the assigned technician");

        input.setLoggedAt(input.getLoggedAt() == null ? java.time.LocalDateTime.now() : input.getLoggedAt());
        input.setCreatedAt(input.getCreatedAt() == null ? java.time.LocalDateTime.now() : input.getCreatedAt());
        order.setLabourMinutes((order.getLabourMinutes() == null ? 0 : order.getLabourMinutes()) + input.getMinutes());
        order.setTotalCost((order.getTotalCost() == null ? java.math.BigDecimal.ZERO : order.getTotalCost()).add(java.math.BigDecimal.ZERO));
        workOrderRepository.save(order);
        return timeLogRepository.save(input);
    }

    public List<TimeLog> getByWorkOrder(Long workOrderId) {
        WorkOrder order = workOrderRepository.findById(workOrderId).orElseThrow(() -> new IllegalArgumentException("Work order not found"));
        if (authorizationService.hasRole("CUSTOMER")) {
            if (!authorizationService.isCurrentCustomer(order.getCustomerId())) throw new AccessDeniedException("You cannot view another customer's time data");
        } else if (authorizationService.hasRole("TECHNICIAN")) {
            if (!authorizationService.isCurrentTechnician(order.getTechnicianId())) throw new AccessDeniedException("You cannot view another technician's time data");
        } else if (!authorizationService.hasRole("DISPATCHER") && !authorizationService.hasRole("MANAGER") && !authorizationService.hasRole("ADMIN")) {
            throw new AccessDeniedException("You don't have permission to view time logs");
        }
        return timeLogRepository.findByWorkOrderIdOrderByLoggedAtAsc(workOrderId);
    }
}