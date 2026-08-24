package com.fsm.service;

import com.fsm.entity.WorkOrder;
import com.fsm.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;

    public WorkOrderService(WorkOrderRepository workOrderRepository) {
        this.workOrderRepository = workOrderRepository;
    }

    // Get all work orders
    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAll();
    }

    // Get work order by ID
    public WorkOrder getWorkOrderById(Long id) {

        return workOrderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: " + id));
    }

    // Create work order
    public WorkOrder createWorkOrder(WorkOrder workOrder) {

    if (workOrder.getStatus() == null) {
        workOrder.setStatus(WorkOrder.Status.PENDING);
    }

    if (workOrder.getPriority() == null) {
        workOrder.setPriority(
                com.fsm.entity.Priority.MEDIUM
        );
    }

    return workOrderRepository.save(workOrder);
}

    // Update work order
    public WorkOrder updateWorkOrder(
            Long id,
            WorkOrder workOrderDetails) {

        WorkOrder workOrder = getWorkOrderById(id);

        // Closed/cancelled jobs should not be edited
        if (workOrder.getStatus() == WorkOrder.Status.COMPLETED ||
            workOrder.getStatus() == WorkOrder.Status.CANCELLED) {

            throw new RuntimeException(
                    "Completed or cancelled work orders cannot be edited");
        }

        workOrder.setServiceRequestId(
                workOrderDetails.getServiceRequestId());

        workOrder.setTechnicianId(
                workOrderDetails.getTechnicianId());

        workOrder.setCustomerId(
                workOrderDetails.getCustomerId());

        workOrder.setSiteId(
                workOrderDetails.getSiteId());

        workOrder.setTitle(
                workOrderDetails.getTitle());

        workOrder.setPriority(
                workOrderDetails.getPriority());

        workOrder.setOrderNumber(
                workOrderDetails.getOrderNumber());

        workOrder.setDescription(
                workOrderDetails.getDescription());

        workOrder.setStatus(
                workOrderDetails.getStatus());

        workOrder.setScheduledDate(
                workOrderDetails.getScheduledDate());

        workOrder.setCompletedDate(
                workOrderDetails.getCompletedDate());

        workOrder.setTotalCost(
                workOrderDetails.getTotalCost());

        return workOrderRepository.save(workOrder);
    }

    // Assign technician
    public WorkOrder assignTechnician(
            Long id,
            Long technicianId) {

        WorkOrder workOrder = getWorkOrderById(id);

        if (workOrder.getStatus() == WorkOrder.Status.COMPLETED ||
            workOrder.getStatus() == WorkOrder.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cannot assign a completed or cancelled work order");
        }

        workOrder.setTechnicianId(technicianId);

        workOrder.setStatus(
                WorkOrder.Status.ASSIGNED);

        return workOrderRepository.save(workOrder);
    }

    // Update status
    public WorkOrder updateStatus(
            Long id,
            WorkOrder.Status status) {

        WorkOrder workOrder = getWorkOrderById(id);

        if (workOrder.getStatus() == WorkOrder.Status.COMPLETED ||
            workOrder.getStatus() == WorkOrder.Status.CANCELLED) {

            throw new RuntimeException(
                    "Completed or cancelled work orders cannot change status");
        }

        workOrder.setStatus(status);

        if (status == WorkOrder.Status.COMPLETED) {
            workOrder.setCompletedDate(
                    java.time.LocalDateTime.now());
        }

        return workOrderRepository.save(workOrder);
    }

    // Get customer work orders
    public List<WorkOrder> getWorkOrdersByCustomer(
            Long customerId) {

        return workOrderRepository
                .findByCustomerId(customerId);
    }

    // Get technician work orders
    public List<WorkOrder> getWorkOrdersByTechnician(
            Long technicianId) {

        return workOrderRepository
                .findByTechnicianId(technicianId);
    }

    // Get work orders by status
    public List<WorkOrder> getWorkOrdersByStatus(
            WorkOrder.Status status) {

        return workOrderRepository
                .findByStatus(status);
    }
}