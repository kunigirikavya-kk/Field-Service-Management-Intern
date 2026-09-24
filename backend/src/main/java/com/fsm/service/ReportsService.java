package com.fsm.service;

import com.fsm.entity.WorkOrder;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportsService {
    private final WorkOrderRepository workOrderRepository;
    private final AuthorizationService authorizationService;

    public ReportsService(WorkOrderRepository workOrderRepository, AuthorizationService authorizationService) {
        this.workOrderRepository = workOrderRepository;
        this.authorizationService = authorizationService;
    }

    public Map<String,Object> summary() {
        if (!authorizationService.hasRole("MANAGER") && !authorizationService.hasRole("ADMIN"))
            throw new AccessDeniedException("Manager/Admin access required");

        List<WorkOrder> orders = workOrderRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        Map<String,Long> byStatus = orders.stream().collect(Collectors.groupingBy(
                o -> o.getStatus() == null ? "UNKNOWN" : (o.getStatus() == WorkOrder.Status.PENDING ? "NEW" : o.getStatus().name()),
                LinkedHashMap::new, Collectors.counting()));

        long overdue = orders.stream().filter(o -> o.getSlaDueAt()!=null && o.getSlaDueAt().isBefore(now)
                && o.getStatus()!=WorkOrder.Status.CLOSED && o.getStatus()!=WorkOrder.Status.CANCELLED).count();
        long breached = orders.stream().filter(WorkOrder::isSlaBreached).count();
        long withSla = orders.stream().filter(o -> o.getSlaDueAt()!=null).count();

        Map<String,Long> byTechnician = orders.stream().filter(o -> o.getTechnicianId()!=null)
                .collect(Collectors.groupingBy(o -> String.valueOf(o.getTechnicianId()), LinkedHashMap::new, Collectors.counting()));
        Map<String,Long> bySite = orders.stream().filter(o -> o.getSiteId()!=null)
                .collect(Collectors.groupingBy(o -> String.valueOf(o.getSiteId()), LinkedHashMap::new, Collectors.counting()));

        Map<String,Object> result = new LinkedHashMap<>();
        result.put("totalWorkOrders", orders.size());
        result.put("statusCounts", byStatus);
        result.put("overdueWorkOrders", overdue);
        result.put("slaBreaches", breached);
        result.put("slaCompliancePercent", withSla == 0 ? 100.0 : ((withSla - breached) * 100.0 / withSla));
        result.put("workOrdersByTechnician", byTechnician);
        result.put("workOrdersBySite", bySite);
        return result;
    }
}