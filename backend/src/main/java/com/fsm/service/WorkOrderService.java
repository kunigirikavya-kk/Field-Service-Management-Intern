package com.fsm.service;

import com.fsm.entity.Site;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.SiteRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;\nimport org.springframework.data.domain.Page;\nimport org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final SiteRepository siteRepository;
    private final AuthorizationService authorizationService;
    private final WorkOrderStatusHistoryService historyService;
    private final SlaService slaService;

    public WorkOrderService(
            WorkOrderRepository workOrderRepository,
            SiteRepository siteRepository,
            AuthorizationService authorizationService,
            WorkOrderStatusHistoryService historyService,
            SlaService slaService) {

        this.workOrderRepository =
                workOrderRepository;

        this.siteRepository =
                siteRepository;

        this.authorizationService = authorizationService;
        this.historyService = historyService;
        this.slaService = slaService;
    }

    public List<WorkOrder> getAllWorkOrders() {

        if (
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER") ||
                authorizationService.hasRole("ADMIN")
        ) {
            return workOrderRepository.findAll();
        }

        throw new AccessDeniedException(
                "Only Dispatcher or Manager can access all work orders"
        );
    }

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

        if (
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER")
        ) {
            return workOrder;
        }

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

        if (authorizationService.hasRole("CUSTOMER")) {

            Long currentCustomerId =
                    authorizationService
                            .getCurrentCustomerId();

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

        if (workOrder.getServiceRequestId() == null) {

            throw new RuntimeException(
                    "Service Request ID is required"
            );
        }

        if (workOrder.getCustomerId() == null) {

            throw new RuntimeException(
                    "Customer ID is required"
            );
        }

        if (workOrder.getSiteId() == null) {

            throw new RuntimeException(
                    "Site ID is required"
            );
        }

        /*
         * =====================================================
         * SITE / CUSTOMER VALIDATION
         * =====================================================
         *
         * A work order's site must belong to the same customer.
         */

        validateSiteBelongsToCustomer(
                workOrder.getSiteId(),
                workOrder.getCustomerId()
        );


        String orderNumber =
                generateUniqueOrderNumber();

        workOrder.setOrderNumber(
                orderNumber
        );


        if (
                workOrder.getTitle() == null ||
                workOrder.getTitle().isBlank()
        ) {

            throw new RuntimeException(
                    "Work order title is required"
            );
        }


        if (workOrder.getStatus() == null) {

            workOrder.setStatus(WorkOrder.Status.NEW);

        }


        if (workOrder.getPriority() == null) {

            workOrder.setPriority(
                    com.fsm.entity.Priority.MEDIUM
            );

        }


        if (workOrder.getTotalCost() == null) {

            workOrder.setTotalCost(
                    BigDecimal.ZERO
            );

        }


        if (workOrder.getCreatedAt() == null) {
            workOrder.setCreatedAt(LocalDateTime.now());
        }
        slaService.applyDueDate(workOrder);
        WorkOrder saved = workOrderRepository.save(workOrder);
        historyService.record(saved.getId(), null, saved.getStatus(), "Work order created");
        return saved;
    }

    public Page<WorkOrder> getPagedWorkOrders(String rawStatus, Pageable pageable) {
        WorkOrder.Status status = null;
        if (rawStatus != null && !rawStatus.isBlank()) {
            try {
                status = WorkOrder.Status.valueOf(rawStatus.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid work order status: " + rawStatus);
            }
        }

        if (authorizationService.hasRole("CUSTOMER")) {
            Long customerId = authorizationService.getCurrentCustomerId();
            return status == null
                    ? workOrderRepository.findByCustomerId(customerId, pageable)
                    : workOrderRepository.findByCustomerIdAndStatus(customerId, status, pageable);
        }

        if (authorizationService.hasRole("TECHNICIAN")) {
            Long technicianId = authorizationService.getCurrentTechnicianId();
            return status == null
                    ? workOrderRepository.findByTechnicianId(technicianId, pageable)
                    : workOrderRepository.findByTechnicianIdAndStatus(technicianId, status, pageable);
        }

        if (authorizationService.hasRole("DISPATCHER")
                || authorizationService.hasRole("MANAGER")
                || authorizationService.hasRole("ADMIN")) {
            return status == null
                    ? workOrderRepository.findAll(pageable)
                    : workOrderRepository.findByStatus(status, pageable);
        }

        throw new AccessDeniedException("You are not allowed to access work orders");
    }

    private void validateSiteBelongsToCustomer(
            Long siteId,
            Long customerId) {

        Site site =
                siteRepository
                        .findById(siteId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Site not found with id: "
                                                + siteId
                                )
                        );


        if (
                site.getCustomerId() == null ||
                !site.getCustomerId()
                        .equals(customerId)
        ) {

            throw new AccessDeniedException(
                    "The selected site does not belong to the selected customer"
            );

        }

    }

    private String generateUniqueOrderNumber() {

        List<WorkOrder> existingWorkOrders =
                workOrderRepository.findAll();

        int highestNumber = 0;

        Pattern pattern =
                Pattern.compile("^WO-(\\d+)$");

        for (
                WorkOrder existingWorkOrder :
                existingWorkOrders
        ) {

            String existingOrderNumber =
                    existingWorkOrder.getOrderNumber();

            if (
                    existingOrderNumber == null ||
                    existingOrderNumber.isBlank()
            ) {
                continue;
            }


            Matcher matcher =
                    pattern.matcher(
                            existingOrderNumber.trim()
                    );


            if (matcher.matches()) {

                try {

                    int number =
                            Integer.parseInt(
                                    matcher.group(1)
                            );


                    if (number > highestNumber) {

                        highestNumber =
                                number;

                    }

                } catch (
                        NumberFormatException ignored
                ) {
                }

            }

        }


        int nextNumber =
                Math.max(
                        highestNumber + 1,
                        1000
                );


        String orderNumber;


        do {

            orderNumber =
                    "WO-" + nextNumber;

            nextNumber++;

        } while (
                workOrderRepository
                        .existsByOrderNumber(
                                orderNumber
                        )
        );


        return orderNumber;
    }

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


        if (
                workOrder.getStatus() == WorkOrder.Status.CLOSED ||
                workOrder.getStatus() == WorkOrder.Status.CANCELLED
        ) {

            throw new RuntimeException(
                    "Completed or cancelled work orders cannot be edited"
            );

        }


        if (
                workOrderDetails.getCustomerId() == null
        ) {

            throw new RuntimeException(
                    "Customer ID is required"
            );

        }


        if (
                workOrderDetails.getSiteId() == null
        ) {

            throw new RuntimeException(
                    "Site ID is required"
            );

        }


        /*
         * =====================================================
         * SITE / CUSTOMER VALIDATION
         * =====================================================
         */

        validateSiteBelongsToCustomer(
                workOrderDetails.getSiteId(),
                workOrderDetails.getCustomerId()
        );


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

        com.fsm.entity.Priority previousPriority = workOrder.getPriority();
        workOrder.setPriority(workOrderDetails.getPriority());


        if (
                workOrderDetails.getOrderNumber() != null &&
                !workOrderDetails
                        .getOrderNumber()
                        .isBlank() &&
                !workOrderDetails
                        .getOrderNumber()
                        .equals(
                                workOrder.getOrderNumber()
                        )
        ) {

            String requestedOrderNumber =
                    workOrderDetails
                            .getOrderNumber()
                            .trim();


            if (
                    workOrderRepository
                            .existsByOrderNumber(
                                    requestedOrderNumber
                            )
            ) {

                throw new RuntimeException(
                        "Work order number already exists: "
                                + requestedOrderNumber
                );

            }


            workOrder.setOrderNumber(
                    requestedOrderNumber
            );

        }


        workOrder.setDescription(
                workOrderDetails.getDescription()
        );

        if (workOrderDetails.getStatus() != null && workOrderDetails.getStatus() != workOrder.getStatus()) {
            throw new IllegalArgumentException("Status changes must use the dedicated lifecycle endpoint.");
        }

        workOrder.setScheduledDate(
                workOrderDetails.getScheduledDate()
        );

        workOrder.setCompletedDate(
                workOrderDetails.getCompletedDate()
        );

        workOrder.setTotalCost(workOrderDetails.getTotalCost() == null ? workOrder.getTotalCost() : workOrderDetails.getTotalCost());
        if (workOrder.getPriority() != previousPriority || workOrder.getSlaDueAt() == null) {
            slaService.applyDueDate(workOrder);
        }
        return workOrderRepository.save(workOrder);
    }

    @Transactional
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


        if (workOrder.getStatus() == WorkOrder.Status.CLOSED || workOrder.getStatus() == WorkOrder.Status.CANCELLED) {
            throw new RuntimeException("Cannot assign a closed or cancelled work order");
        }
        if (workOrder.getStatus() != WorkOrder.Status.NEW && workOrder.getStatus() != WorkOrder.Status.ASSIGNED) {
            throw new RuntimeException("Technician assignment is only allowed before work starts");
        }


        if (technicianId == null) {

            throw new RuntimeException(
                    "Technician ID is required"
            );

        }


        WorkOrder.Status previousStatus = workOrder.getStatus();
        workOrder.setTechnicianId(technicianId);
        workOrder.setStatus(WorkOrder.Status.ASSIGNED);
        WorkOrder saved = workOrderRepository.save(workOrder);
        if (previousStatus != WorkOrder.Status.ASSIGNED) {
            historyService.record(saved.getId(), previousStatus, WorkOrder.Status.ASSIGNED, "Technician assigned");
        } else {
            historyService.record(saved.getId(), previousStatus, WorkOrder.Status.ASSIGNED, "Technician reassigned");
        }
        return saved;
    }

    @Transactional
    public WorkOrder updateStatus(Long id, WorkOrder.Status targetStatus) {
        if (targetStatus == null) throw new IllegalArgumentException("Status is required");

        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found with id: " + id));
        WorkOrder.Status current = normalizeLegacyStatus(order.getStatus());
        targetStatus = normalizeLegacyStatus(targetStatus);

        if (current == WorkOrder.Status.CLOSED || current == WorkOrder.Status.CANCELLED) {
            throw new IllegalStateException("Terminal work orders cannot transition further");
        }

        boolean technician = authorizationService.hasRole("TECHNICIAN");
        boolean manager = authorizationService.hasRole("MANAGER") || authorizationService.hasRole("ADMIN");
        boolean dispatcher = authorizationService.hasRole("DISPATCHER");

        if (technician) {
            Long technicianId = authorizationService.getCurrentTechnicianId();
            if (!technicianId.equals(order.getTechnicianId())) throw new AccessDeniedException("You can only update jobs assigned to you");
            if (!(targetStatus == WorkOrder.Status.IN_PROGRESS || targetStatus == WorkOrder.Status.ON_HOLD || targetStatus == WorkOrder.Status.COMPLETED))
                throw new AccessDeniedException("Technicians can only start, hold/resume, or complete their assigned jobs");
        } else if (!dispatcher && !manager) {
            throw new AccessDeniedException("You don't have permission to change work-order status");
        }

        if (targetStatus == WorkOrder.Status.CLOSED) {
            if (!manager) throw new AccessDeniedException("Only a Manager or Admin can close a completed work order");
            if (current != WorkOrder.Status.COMPLETED) throw new IllegalStateException("Only COMPLETED work orders can be closed");
        } else if (manager || dispatcher) {
            if (targetStatus == WorkOrder.Status.IN_PROGRESS || targetStatus == WorkOrder.Status.ON_HOLD || targetStatus == WorkOrder.Status.COMPLETED) {
                throw new AccessDeniedException("Dispatcher/Manager should use assignment or technician execution for field status changes");
            }
        }

        if (!isAllowedTransition(current, targetStatus)) {
            throw new IllegalStateException("Illegal lifecycle transition: " + current + " -> " + targetStatus);
        }

        order.setStatus(targetStatus);
        if (targetStatus == WorkOrder.Status.COMPLETED) order.setCompletedDate(LocalDateTime.now());
        WorkOrder saved = workOrderRepository.save(order);
        historyService.record(saved.getId(), current, targetStatus, null);
        return saved;
    }

    private WorkOrder.Status normalizeLegacyStatus(WorkOrder.Status status) {
        return status == WorkOrder.Status.PENDING ? WorkOrder.Status.NEW : status;
    }

    private boolean isAllowedTransition(WorkOrder.Status from, WorkOrder.Status to) {
        return switch (from) {
            case NEW -> to == WorkOrder.Status.ASSIGNED || to == WorkOrder.Status.CANCELLED;
            case ASSIGNED -> to == WorkOrder.Status.IN_PROGRESS || to == WorkOrder.Status.CANCELLED;
            case IN_PROGRESS -> to == WorkOrder.Status.ON_HOLD || to == WorkOrder.Status.COMPLETED;
            case ON_HOLD -> to == WorkOrder.Status.IN_PROGRESS;
            case COMPLETED -> to == WorkOrder.Status.CLOSED;
            case CLOSED, CANCELLED -> false;
            case PENDING -> false;
        };
    }

    public List<WorkOrder> getWorkOrdersByCustomer(
            Long customerId) {

        if (customerId == null) {

            throw new RuntimeException(
                    "Customer ID is required"
            );

        }


        if (authorizationService.hasRole("CUSTOMER")) {

            Long currentCustomerId =
                    authorizationService
                            .getCurrentCustomerId();


            if (!currentCustomerId.equals(customerId)) {

                throw new AccessDeniedException(
                        "You are not allowed to access another customer's work orders"
                );

            }


            return workOrderRepository
                    .findByCustomerId(
                            customerId
                    );

        }


        if (
                authorizationService.hasRole("DISPATCHER") ||
                authorizationService.hasRole("MANAGER")
        ) {

            return workOrderRepository
                    .findByCustomerId(
                            customerId
                    );

        }


        throw new AccessDeniedException(
                "You don't have permission to access these work orders"
        );
    }

    public List<WorkOrder> getWorkOrdersByTechnician(
            Long technicianId) {

        if (technicianId == null) {

            throw new RuntimeException(
                    "Technician ID is required"
            );

        }


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
                    .findByStatus(
                            status
                    );

        }


        throw new AccessDeniedException(
                "Only Dispatcher or Manager can access work orders by status"
        );
    }
}