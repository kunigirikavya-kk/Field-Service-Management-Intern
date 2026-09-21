package com.fsm.service;

import com.fsm.entity.Site;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.SiteRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

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

    public WorkOrderService(
            WorkOrderRepository workOrderRepository,
            SiteRepository siteRepository,
            AuthorizationService authorizationService) {

        this.workOrderRepository =
                workOrderRepository;

        this.siteRepository =
                siteRepository;

        this.authorizationService =
                authorizationService;
    }

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

            workOrder.setStatus(
                    WorkOrder.Status.PENDING
            );

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

            workOrder.setCreatedAt(
                    LocalDateTime.now()
            );

        }


        return workOrderRepository.save(
                workOrder
        );
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
                workOrder.getStatus() ==
                        WorkOrder.Status.COMPLETED ||
                workOrder.getStatus() ==
                        WorkOrder.Status.CANCELLED
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

        workOrder.setPriority(
                workOrderDetails.getPriority()
        );


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


        return workOrderRepository.save(
                workOrder
        );
    }

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


            if (
                    status != WorkOrder.Status.IN_PROGRESS &&
                    status != WorkOrder.Status.COMPLETED
            ) {

                throw new AccessDeniedException(
                        "Technicians can only move their jobs to IN_PROGRESS or COMPLETED"
                );

            }

        }


        if (authorizationService.hasRole("CUSTOMER")) {

            throw new AccessDeniedException(
                    "Customers cannot update work order status"
            );

        }


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


        workOrder.setStatus(
                status
        );


        if (
                status ==
                        WorkOrder.Status.COMPLETED
        ) {

            workOrder.setCompletedDate(
                    LocalDateTime.now()
            );

        }


        return workOrderRepository.save(
                workOrder
        );
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