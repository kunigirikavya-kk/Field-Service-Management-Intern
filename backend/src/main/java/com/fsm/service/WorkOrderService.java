package com.fsm.service;

import com.fsm.entity.WorkOrder;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final AuthorizationService authorizationService;

    public WorkOrderService(
            WorkOrderRepository workOrderRepository,
            AuthorizationService authorizationService) {

        this.workOrderRepository =
                workOrderRepository;

        this.authorizationService =
                authorizationService;
    }

    // =====================================================
    // GET ALL WORK ORDERS
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    public List<WorkOrder> getAllWorkOrders() {

        if (
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER")
        ) {

            return workOrderRepository.findAll();
        }

        throw new AccessDeniedException(
                "Only Dispatcher or Manager can access all work orders"
        );
    }

    // =====================================================
    // GET WORK ORDER BY ID
    // =====================================================

    public WorkOrder getWorkOrderById(Long id) {

        WorkOrder workOrder =
                workOrderRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work order not found with id: "
                                                + id
                                )
                        );

        // =================================================
        // DISPATCHER / MANAGER
        // =================================================

        if (
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER")
        ) {

            return workOrder;
        }

        // =================================================
        // TECHNICIAN
        // =================================================

        if (authorizationService.hasRole("TECHNICIAN")) {

            Long currentTechnicianId =
                    authorizationService
                            .getCurrentTechnicianId();

            if (
                    workOrder.getTechnicianId() != null &&
                    workOrder.getTechnicianId()
                            .equals(currentTechnicianId)
            ) {

                return workOrder;
            }

            throw new AccessDeniedException(
                    "You are not allowed to access this work order"
            );
        }

        // =================================================
        // CUSTOMER
        // =================================================

        if (authorizationService.hasRole("CUSTOMER")) {

            Long currentCustomerId =
                    authorizationService
                            .getCurrentUserId();

            if (
                    workOrder.getCustomerId() != null &&
                    workOrder.getCustomerId()
                            .equals(currentCustomerId)
            ) {

                return workOrder;
            }

            throw new AccessDeniedException(
                    "You are not allowed to access this work order"
            );
        }

        throw new AccessDeniedException(
                "You don't have permission to access this work order"
        );
    }

    // =====================================================
    // CREATE WORK ORDER
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    public WorkOrder createWorkOrder(
            WorkOrder workOrder) {

        if (
                !authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")
        ) {

            throw new AccessDeniedException(
                    "Only Dispatcher or Manager can create work orders"
            );
        }

        // =================================================
        // SERVICE REQUEST
        // =================================================

        if (workOrder.getServiceRequestId() == null) {

            throw new RuntimeException(
                    "Service Request ID is required"
            );
        }

        // =================================================
        // CUSTOMER
        // =================================================

        if (workOrder.getCustomerId() == null) {

            throw new RuntimeException(
                    "Customer ID is required"
            );
        }

        // =================================================
        // SITE
        // =================================================

        if (workOrder.getSiteId() == null) {

            throw new RuntimeException(
                    "Site ID is required"
            );
        }

        // =================================================
        // ORDER NUMBER
        // =================================================

        if (
                workOrder.getOrderNumber() == null ||
                workOrder.getOrderNumber().isBlank()
        ) {

            throw new RuntimeException(
                    "Order number is required"
            );
        }

        // =================================================
        // TITLE
        // =================================================

        if (
                workOrder.getTitle() == null ||
                workOrder.getTitle().isBlank()
        ) {

            throw new RuntimeException(
                    "Work order title is required"
            );
        }

        // =================================================
        // DEFAULT STATUS
        // =================================================

        if (workOrder.getStatus() == null) {

            workOrder.setStatus(
                    WorkOrder.Status.PENDING
            );
        }

        // =================================================
        // DEFAULT PRIORITY
        // =================================================

        if (workOrder.getPriority() == null) {

            workOrder.setPriority(
                    com.fsm.entity.Priority.MEDIUM
            );
        }

        // =================================================
        // DEFAULT TOTAL COST
        // =================================================

        if (workOrder.getTotalCost() == null) {

            workOrder.setTotalCost(
                    BigDecimal.ZERO
            );
        }

        // =================================================
        // SAVE
        // =================================================

        return workOrderRepository.save(
                workOrder
        );
    }

    // =====================================================
    // UPDATE WORK ORDER
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    public WorkOrder updateWorkOrder(
            Long id,
            WorkOrder workOrderDetails) {

        if (
                !authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")
        ) {

            throw new AccessDeniedException(
                    "Only Dispatcher or Manager can update work orders"
            );
        }

        WorkOrder workOrder =
                getWorkOrderById(id);

        // =================================================
        // COMPLETED / CANCELLED CHECK
        // =================================================

        if (
                workOrder.getStatus() ==
                        WorkOrder.Status.COMPLETED ||
                workOrder.getStatus() ==
                        WorkOrder.Status.CANCELLED
        ) {

            throw new RuntimeException(
                    "Completed or cancelled work orders cannot be edited"
            );
        }

        // =================================================
        // UPDATE FIELDS
        // =================================================

        workOrder.setServiceRequestId(
                workOrderDetails.getServiceRequestId()
        );

        workOrder.setTechnicianId(
                workOrderDetails.getTechnicianId()
        );

        workOrder.setCustomerId(
                workOrderDetails.getCustomerId()
        );

        workOrder.setSiteId(
                workOrderDetails.getSiteId()
        );

        workOrder.setTitle(
                workOrderDetails.getTitle()
        );

        workOrder.setPriority(
                workOrderDetails.getPriority()
        );

        workOrder.setOrderNumber(
                workOrderDetails.getOrderNumber()
        );

        workOrder.setDescription(
                workOrderDetails.getDescription()
        );

        workOrder.setStatus(
                workOrderDetails.getStatus()
        );

        workOrder.setScheduledDate(
                workOrderDetails.getScheduledDate()
        );

        workOrder.setCompletedDate(
                workOrderDetails.getCompletedDate()
        );

        workOrder.setTotalCost(
                workOrderDetails.getTotalCost()
        );

        // =================================================
        // SAVE
        // =================================================

        return workOrderRepository.save(
                workOrder
        );
    }

    // =====================================================
    // ASSIGN TECHNICIAN
    // DISPATCHER / MANAGER ONLY
    // =====================================================

    public WorkOrder assignTechnician(
            Long id,
            Long technicianId) {

        if (
                !authorizationService.hasRole("DISPATCHER") &&
                !authorizationService.hasRole("MANAGER")
        ) {

            throw new AccessDeniedException(
                    "Only Dispatcher or Manager can assign technicians"
            );
        }

        WorkOrder workOrder =
                getWorkOrderById(id);

        if (
                workOrder.getStatus() ==
                        WorkOrder.Status.COMPLETED ||
                workOrder.getStatus() ==
                        WorkOrder.Status.CANCELLED
        ) {

            throw new RuntimeException(
                    "Cannot assign a completed or cancelled work order"
            );
        }

        if (technicianId == null) {

            throw new RuntimeException(
                    "Technician ID is required"
            );
        }

        workOrder.setTechnicianId(
                technicianId
        );

        workOrder.setStatus(
                WorkOrder.Status.ASSIGNED
        );

        return workOrderRepository.save(
                workOrder
        );
    }

    // =====================================================
    // UPDATE STATUS
    // TECHNICIAN / DISPATCHER / MANAGER
    // =====================================================

    public WorkOrder updateStatus(
            Long id,
            WorkOrder.Status status) {

        if (status == null) {

            throw new RuntimeException(
                    "Status is required"
            );
        }

        WorkOrder workOrder =
                workOrderRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work order not found with id: "
                                                + id
                                )
                        );

        // =================================================
        // TECHNICIAN
        // =================================================

        if (authorizationService.hasRole("TECHNICIAN")) {

            Long currentTechnicianId =
                    authorizationService
                            .getCurrentTechnicianId();

            if (
                    workOrder.getTechnicianId() == null ||
                    !workOrder.getTechnicianId()
                            .equals(currentTechnicianId)
            ) {

                throw new AccessDeniedException(
                        "You are not allowed to update this work order"
                );
            }

            // ---------------------------------------------
            // TECHNICIAN STATUS RULES
            // ---------------------------------------------

            if (
                    status != WorkOrder.Status.IN_PROGRESS &&
                    status != WorkOrder.Status.COMPLETED
            ) {

                throw new AccessDeniedException(
                        "Technicians can only move their jobs to IN_PROGRESS or COMPLETED"
                );
            }
        }

        // =================================================
        // CUSTOMER
        // =================================================

        if (authorizationService.hasRole("CUSTOMER")) {

            throw new AccessDeniedException(
                    "Customers cannot update work order status"
            );
        }

        // =================================================
        // COMPLETED / CANCELLED CHECK
        // =================================================

        if (
                workOrder.getStatus() ==
                        WorkOrder.Status.COMPLETED ||
                workOrder.getStatus() ==
                        WorkOrder.Status.CANCELLED
        ) {

            throw new RuntimeException(
                    "Completed or cancelled work orders cannot change status"
            );
        }

        // =================================================
        // UPDATE STATUS
        // =================================================

        workOrder.setStatus(
                status
        );

        // =================================================
        // COMPLETED DATE
        // =================================================

        if (
                status ==
                        WorkOrder.Status.COMPLETED
        ) {

            workOrder.setCompletedDate(
                    LocalDateTime.now()
            );
        }

        // =================================================
        // SAVE
        // =================================================

        return workOrderRepository.save(
                workOrder
        );
    }

    // =====================================================
    // CUSTOMER WORK ORDERS
    // =====================================================

    public List<WorkOrder> getWorkOrdersByCustomer(
            Long customerId) {

        if (customerId == null) {

            throw new RuntimeException(
                    "Customer ID is required"
            );
        }

        // =================================================
        // CUSTOMER → ONLY THEIR OWN
        // =================================================

        if (authorizationService.hasRole("CUSTOMER")) {

            Long currentCustomerId =
                    authorizationService
                            .getCurrentUserId();

            if (
                    !currentCustomerId
                            .equals(customerId)
            ) {

                throw new AccessDeniedException(
                        "You are not allowed to access another customer's work orders"
                );
            }

            return workOrderRepository
                    .findByCustomerId(customerId);
        }

        // =================================================
        // DISPATCHER / MANAGER
        // =================================================

        if (
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER")
        ) {

            return workOrderRepository
                    .findByCustomerId(customerId);
        }

        throw new AccessDeniedException(
                "You don't have permission to access these work orders"
        );
    }

    // =====================================================
    // TECHNICIAN WORK ORDERS
    // =====================================================

    public List<WorkOrder> getWorkOrdersByTechnician(
            Long technicianId) {

        if (technicianId == null) {

            throw new RuntimeException(
                    "Technician ID is required"
            );
        }

        // =================================================
        // TECHNICIAN → ONLY THEIR OWN
        // =================================================

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (
                    !authorizationService
                            .isCurrentTechnician(
                                    technicianId
                            )
            ) {

                throw new AccessDeniedException(
                        "You are not allowed to access another technician's work orders"
                );
            }

            return workOrderRepository
                    .findByTechnicianId(
                            technicianId
                    );
        }

        // =================================================
        // DISPATCHER / MANAGER
        // =================================================

        if (
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER")
        ) {

            return workOrderRepository
                    .findByTechnicianId(
                            technicianId
                    );
        }

        throw new AccessDeniedException(
                "You don't have permission to access these work orders"
        );
    }

    // =====================================================
    // STATUS WORK ORDERS
    // DISPATCHER / MANAGER
    // =====================================================

    public List<WorkOrder> getWorkOrdersByStatus(
            WorkOrder.Status status) {

        if (status == null) {

            throw new RuntimeException(
                    "Status is required"
            );
        }

        if (
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER")
        ) {

            return workOrderRepository
                    .findByStatus(status);
        }

        throw new AccessDeniedException(
                "Only Dispatcher or Manager can access work orders by status"
        );
    }
}