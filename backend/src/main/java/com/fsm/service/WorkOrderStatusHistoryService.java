package com.fsm.service;

import com.fsm.entity.WorkOrder;
import com.fsm.entity.WorkOrderStatusHistory;
import com.fsm.repository.WorkOrderStatusHistoryRepository;
import com.fsm.security.AuthorizationService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WorkOrderStatusHistoryService {
    private final WorkOrderStatusHistoryRepository repository;
    private final AuthorizationService authorizationService;

    public WorkOrderStatusHistoryService(WorkOrderStatusHistoryRepository repository, AuthorizationService authorizationService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
    }

    public void record(Long workOrderId, WorkOrder.Status from, WorkOrder.Status to, String note) {
        WorkOrderStatusHistory history = new WorkOrderStatusHistory();
        history.setWorkOrderId(workOrderId);
        history.setFromStatus(from == null ? null : from.name());
        history.setToStatus(to.name());
        history.setChangedByUserId(authorizationService.getCurrentUserId());
        history.setNote(note);
        repository.save(history);
    }

    public List<WorkOrderStatusHistory> getHistory(Long workOrderId) {
        return repository.findByWorkOrderIdOrderByChangedAtAsc(workOrderId);
    }
}