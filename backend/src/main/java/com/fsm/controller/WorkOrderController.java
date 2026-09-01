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

        this.workOrderService =
                workOrderService;
    }

    // =====================================================
    // GET ALL WORK ORDERS
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    @GetMapping
    public ResponseEntity<List<WorkOrder>>
    getAllWorkOrders() {

        return ResponseEntity.ok(
                workOrderService.getAllWorkOrders()
        );
    }

    // =====================================================
    // GET WORK ORDER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrder>
    getWorkOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                workOrderService
                        .getWorkOrderById(id)
        );
    }

    // =====================================================
    // CREATE WORK ORDER
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    @PostMapping
    public ResponseEntity<WorkOrder>
    createWorkOrder(
            @Valid @RequestBody WorkOrderRequest request) {

        WorkOrder workOrder =
                mapToEntity(request);

        WorkOrder savedWorkOrder =
                workOrderService
                        .createWorkOrder(workOrder);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedWorkOrder);
    }

    // =====================================================
    // UPDATE WORK ORDER
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<WorkOrder>
    updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderRequest request) {

        WorkOrder workOrder =
                mapToEntity(request);

        return ResponseEntity.ok(
                workOrderService
                        .updateWorkOrder(
                                id,
                                workOrder
                        )
        );
    }

    // =====================================================
    // ASSIGN TECHNICIAN
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    @PostMapping("/{id}/assign")
    public ResponseEntity<WorkOrder>
    assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {

        return ResponseEntity.ok(
                workOrderService
                        .assignTechnician(
                                id,
                                technicianId
                        )
        );
    }

    // =====================================================
    // UPDATE STATUS
    // TECHNICIAN / DISPATCHER / MANAGER
    // =====================================================

    @PostMapping("/{id}/status")
    public ResponseEntity<WorkOrder>
    updateStatus(
            @PathVariable Long id,
            @RequestParam WorkOrder.Status status) {

        return ResponseEntity.ok(
                workOrderService
                        .updateStatus(
                                id,
                                status
                        )
        );
    }

    // =====================================================
    // CUSTOMER WORK ORDERS
    // =====================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<WorkOrder>>
    getByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                workOrderService
                        .getWorkOrdersByCustomer(
                                customerId
                        )
        );
    }

    // =====================================================
    // TECHNICIAN WORK ORDERS
    // =====================================================

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<WorkOrder>>
    getByTechnician(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                workOrderService
                        .getWorkOrdersByTechnician(
                                technicianId
                        )
        );
    }

    // =====================================================
    // WORK ORDERS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkOrder>>
    getByStatus(
            @PathVariable WorkOrder.Status status) {

        return ResponseEntity.ok(
                workOrderService
                        .getWorkOrdersByStatus(
                                status
                        )
        );
    }

    // =====================================================
    // DTO -> ENTITY
    // =====================================================

    private WorkOrder mapToEntity(
            WorkOrderRequest request) {

        WorkOrder workOrder =
                new WorkOrder();

        workOrder.setServiceRequestId(
                request.getServiceRequestId()
        );

        workOrder.setTechnicianId(
                request.getTechnicianId()
        );

        workOrder.setCustomerId(
                request.getCustomerId()
        );

        workOrder.setSiteId(
                request.getSiteId()
        );

        workOrder.setOrderNumber(
                request.getOrderNumber()
        );

        workOrder.setTitle(
                request.getTitle()
        );

        workOrder.setPriority(
                request.getPriority()
        );

        workOrder.setDescription(
                request.getDescription()
        );

        workOrder.setStatus(
                request.getStatus()
        );

        workOrder.setScheduledDate(
                request.getScheduledDate()
        );

        workOrder.setCompletedDate(
                request.getCompletedDate()
        );

        workOrder.setTotalCost(
                request.getTotalCost()
        );

        return workOrder;
    }
}