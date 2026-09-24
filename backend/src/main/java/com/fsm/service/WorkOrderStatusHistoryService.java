package com.fsm.service;

import com.fsm.entity.WorkOrder;
import com.fsm.entity.WorkOrderStatusHistory;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.repository.WorkOrderStatusHistoryRepository;
import com.fsm.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkOrderStatusHistoryService {
    private final WorkOrderStatusHistoryRepository repository;
    private final WorkOrderRepository workOrderRepository;
    private final AuthorizationService authorizationService;

    public WorkOrderStatusHistoryService(
            WorkOrderStatusHistoryRepository repository,
            WorkOrderRepository workOrderRepository,
            AuthorizationService authorizationService) {
        this.repository = repository;
        this.workOrderRepository = workOrderRepository;
        this.authorizationService = authorizationService;
    }

    public void record(
            Long workOrderId,
            WorkOrder.Status from,
            WorkOrder.Status to,
            String note) {

        WorkOrderStatusHistory history = new WorkOrderStatusHistory();
        history.setWorkOrderId(workOrderId);
        history.setFromStatus(from == null ? null : from.name());
        history.setToStatus(to.name());
        history.setChangedByUserId(authorizationService.getCurrentUserId());
        history.setNote(note);
        repository.save(history);
    }

    public List<WorkOrderStatusHistory> getHistory(Long workOrderId) {
        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found with id: " + workOrderId));

        boolean allowed =
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER") ||
                authorizationService.hasRole("ADMIN") ||
                (authorizationService.hasRole("TECHNICIAN")
                        && order.getTechnicianId() != null
                        && order.getTechnicianId().equals(authorizationService.getCurrentTechnicianId())) ||
                (authorizationService.hasRole("CUSTOMER")
                        && order.getCustomerId() != null
                        && order.getCustomerId().equals(authorizationService.getCurrentCustomerId()));

        if (!allowed) {
            throw new AccessDeniedException("You are not allowed to access this work order history");
        }

        return repository.findByWorkOrderIdOrderByChangedAtAsc(workOrderId);
    }
}
