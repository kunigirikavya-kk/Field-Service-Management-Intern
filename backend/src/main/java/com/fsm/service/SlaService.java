package com.fsm.service;

import com.fsm.entity.Notification;
import com.fsm.entity.Priority;
import com.fsm.entity.User;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.UserRepository;
import com.fsm.repository.WorkOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SlaService {
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${sla.hours.low:72}") private long lowHours;
    @Value("${sla.hours.medium:24}") private long mediumHours;
    @Value("${sla.hours.high:8}") private long highHours;
    @Value("${sla.hours.urgent:4}") private long urgentHours;

    public SlaService(WorkOrderRepository workOrderRepository, UserRepository userRepository, NotificationService notificationService) {
        this.workOrderRepository = workOrderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public void applyDueDate(WorkOrder order) {
        if (order.getCreatedAt() == null) order.setCreatedAt(LocalDateTime.now());
        long hours = switch (order.getPriority() == null ? Priority.MEDIUM : order.getPriority()) {
            case LOW -> lowHours;
            case MEDIUM -> mediumHours;
            case HIGH -> highHours;
            case URGENT -> urgentHours;
        };
        order.setSlaDueAt(order.getCreatedAt().plusHours(hours));
        order.setSlaBreached(false);
        order.setSlaBreachNotified(false);
    }

    @Scheduled(fixedDelayString = "${SLA_CHECK_DELAY_MS:300000}")
    @Transactional
    public void checkBreaches() {
        LocalDateTime now = LocalDateTime.now();
        List<WorkOrder> orders = workOrderRepository.findAll();
        List<User> managers = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && ("MANAGER".equalsIgnoreCase(u.getRole().name()) || "ADMIN".equalsIgnoreCase(u.getRole().name())))
                .toList();

        for (WorkOrder order : orders) {
            if (order.getSlaDueAt() == null || order.isSlaBreachNotified()) continue;
            if (order.getStatus() == WorkOrder.Status.CLOSED || order.getStatus() == WorkOrder.Status.CANCELLED || order.getStatus() == WorkOrder.Status.COMPLETED) continue;
            if (order.getSlaDueAt().isBefore(now)) {
                order.setSlaBreached(true);
                order.setSlaBreachNotified(true);
                workOrderRepository.save(order);
                for (User manager : managers) {
                    notificationService.create(
                            manager.getId(),
                            "SLA breach: " + order.getOrderNumber(),
                            "Work order " + order.getOrderNumber() + " is past its SLA due time.",
                            "WARNING"
                    );
                }
            }
        }
    }
}