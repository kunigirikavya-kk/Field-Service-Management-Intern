package com.fsm.controller;

import com.fsm.dto.WorkOrderRequest;
import com.fsm.dto.WorkOrderResponse;
import com.fsm.security.AuthorizationService;
import com.fsm.entity.WorkOrder;
import com.fsm.service.WorkOrderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import com.fsm.dto.PagedResponse;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final AuthorizationService authorizationService;

    public WorkOrderController(
            WorkOrderService workOrderService,
            AuthorizationService authorizationService) {
        this.workOrderService = workOrderService;
        this.authorizationService = authorizationService;
    }

    // =====================================================
    // GET ALL WORK ORDERS
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    @GetMapping
    public ResponseEntity<List<WorkOrderResponse>>
    getAllWorkOrders() {

        return ResponseEntity.ok(toResponses(workOrderService.getAllWorkOrders(), false));
    }

    // =====================================================
    // GET WORK ORDER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponse>
    getWorkOrderById(
            @PathVariable Long id) {

        WorkOrder order = workOrderService.getWorkOrderById(id);
        return ResponseEntity.ok(WorkOrderResponse.from(order, authorizationService.hasRole("CUSTOMER")));
    }

    // =====================================================
    // CREATE WORK ORDER
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    @PostMapping
    public ResponseEntity<WorkOrderResponse>
    createWorkOrder(
            @Valid @RequestBody WorkOrderRequest request) {

        WorkOrder workOrder =
                mapToEntity(request);

        WorkOrder savedWorkOrder =
                workOrderService
                        .createWorkOrder(workOrder);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(WorkOrderResponse.from(savedWorkOrder, false));
    }

    // =====================================================
    // UPDATE WORK ORDER
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<WorkOrderResponse>
    updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderRequest request) {

        WorkOrder workOrder =
                mapToEntity(request);

        return ResponseEntity.ok(WorkOrderResponse.from(workOrderService.updateWorkOrder(id, workOrder), false));
    }

    // =====================================================
    // ASSIGN TECHNICIAN
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    @PostMapping("/{id}/assign")
    public ResponseEntity<WorkOrderResponse>
    assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {

        return ResponseEntity.ok(WorkOrderResponse.from(workOrderService.assignTechnician(id, technicianId), false));
    }

    // =====================================================
    // UPDATE STATUS
    // TECHNICIAN / DISPATCHER / MANAGER
    // =====================================================

    @PostMapping("/{id}/status")
    public ResponseEntity<WorkOrderResponse>
    updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(WorkOrderResponse.from(workOrderService.updateStatus(id, parseStatus(status)), false));
    }

    // =====================================================
    // CUSTOMER WORK ORDERS
    // =====================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<WorkOrderResponse>>
    getByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(toResponses(workOrderService.getWorkOrdersByCustomer(customerId), authorizationService.hasRole("CUSTOMER")));
    }

    // =====================================================
    // TECHNICIAN WORK ORDERS
    // =====================================================

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<WorkOrderResponse>>
    getByTechnician(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(toResponses(workOrderService.getWorkOrdersByTechnician(technicianId), false));
    }

    // =====================================================
    // WORK ORDERS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkOrderResponse>>
    getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(toResponses(workOrderService.getWorkOrdersByStatus(parseStatus(status)), false));
    }


    private List<WorkOrderResponse> toResponses(List<WorkOrder> orders, boolean customerView) {
        return orders.stream().map(order -> WorkOrderResponse.from(order, customerView)).collect(Collectors.toList());
    }

    private WorkOrder.Status parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        try {
            return WorkOrder.Status.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid work order status: " + rawStatus +
                    ". Allowed values: NEW, ASSIGNED, IN_PROGRESS, ON_HOLD, COMPLETED, CLOSED, CANCELLED",
                    ex
            );
        }
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

        /*
         * This may be null during CREATE.
         * WorkOrderService generates the actual
         * unique order number.
         */
        workOrder.setOrderNumber(
                request.getOrderNumber()
        );

        workOrder.setTitle(
                request.getTitle()
        );

        workOrder.setPriority(
                request.getPriority()
        );

        workOrder.setServiceType(
                request.getServiceType()
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