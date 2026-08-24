package com.fsm.controller;

import com.fsm.dto.WorkOrderRequest;
import com.fsm.entity.WorkOrder;
import com.fsm.service.WorkOrderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@CrossOrigin(origins = "http://localhost:5174")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(
            WorkOrderService workOrderService) {

        this.workOrderService = workOrderService;
    }

    // GET /api/work-orders
    @GetMapping
    public ResponseEntity<List<WorkOrder>> getAllWorkOrders() {

        return ResponseEntity.ok(
                workOrderService.getAllWorkOrders()
        );
    }

    // GET /api/work-orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<WorkOrder> getWorkOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                workOrderService.getWorkOrderById(id)
        );
    }

    // POST /api/work-orders
    @PostMapping
    public ResponseEntity<WorkOrder> createWorkOrder(
            @Valid @RequestBody WorkOrderRequest request) {

        WorkOrder workOrder = mapToEntity(request);

        WorkOrder savedWorkOrder =
                workOrderService.createWorkOrder(workOrder);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedWorkOrder);
    }

    // PUT /api/work-orders/{id}
    @PutMapping("/{id}")
    public ResponseEntity<WorkOrder> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderRequest request) {

        WorkOrder workOrder = mapToEntity(request);

        return ResponseEntity.ok(
                workOrderService.updateWorkOrder(
                        id,
                        workOrder
                )
        );
    }

    // POST /api/work-orders/{id}/assign
    @PostMapping("/{id}/assign")
    public ResponseEntity<WorkOrder> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {

        return ResponseEntity.ok(
                workOrderService.assignTechnician(
                        id,
                        technicianId
                )
        );
    }

    // POST /api/work-orders/{id}/status
    @PostMapping("/{id}/status")
    public ResponseEntity<WorkOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam WorkOrder.Status status) {

        return ResponseEntity.ok(
                workOrderService.updateStatus(
                        id,
                        status
                )
        );
    }

    // GET /api/work-orders/customer/{customerId}
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<WorkOrder>> getByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                workOrderService
                        .getWorkOrdersByCustomer(customerId)
        );
    }

    // GET /api/work-orders/technician/{technicianId}
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<WorkOrder>> getByTechnician(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                workOrderService
                        .getWorkOrdersByTechnician(technicianId)
        );
    }

    // GET /api/work-orders/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkOrder>> getByStatus(
            @PathVariable WorkOrder.Status status) {

        return ResponseEntity.ok(
                workOrderService
                        .getWorkOrdersByStatus(status)
        );
    }


    // Convert DTO → Entity
    private WorkOrder mapToEntity(
            WorkOrderRequest request) {

        WorkOrder workOrder = new WorkOrder();

        workOrder.setServiceRequestId(
                request.getServiceRequestId());

        workOrder.setTechnicianId(
                request.getTechnicianId());

        workOrder.setCustomerId(
                request.getCustomerId());

        workOrder.setSiteId(
                request.getSiteId());

        workOrder.setOrderNumber(
                request.getOrderNumber());

        workOrder.setTitle(
                request.getTitle());

        workOrder.setPriority(
                request.getPriority());

        workOrder.setDescription(
                request.getDescription());

        workOrder.setStatus(
                request.getStatus());

        workOrder.setScheduledDate(
                request.getScheduledDate());

        workOrder.setCompletedDate(
                request.getCompletedDate());

        workOrder.setTotalCost(
                request.getTotalCost());

        return workOrder;
    }
}