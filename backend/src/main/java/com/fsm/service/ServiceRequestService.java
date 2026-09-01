// ServiceRequestService.java

package com.fsm.service;

import com.fsm.dto.ServiceRequestRequest;
import com.fsm.entity.Customer;
import com.fsm.entity.ServiceRequest;
import com.fsm.repository.CustomerRepository;
import com.fsm.repository.ServiceRequestRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final CustomerRepository customerRepository;

    public ServiceRequestService(
            ServiceRequestRepository serviceRequestRepository,
            CustomerRepository customerRepository) {

        this.serviceRequestRepository = serviceRequestRepository;
        this.customerRepository = customerRepository;
    }

    // =====================================================
    // GET ALL SERVICE REQUESTS
    // =====================================================

    public List<ServiceRequest> getAllServiceRequests() {

        return serviceRequestRepository.findAll();
    }

    // =====================================================
    // GET SERVICE REQUEST BY ID
    // =====================================================

    public ServiceRequest getServiceRequestById(Long id) {

        return serviceRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Service request not found with id: " + id
                        )
                );
    }

    // =====================================================
    // CREATE SERVICE REQUEST
    // =====================================================

    public ServiceRequest createServiceRequest(
            ServiceRequestRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "Service request data cannot be empty"
            );
        }

        if (request.getCustomerId() == null) {
            throw new RuntimeException(
                    "Customer ID is required"
            );
        }

        /*
         * IMPORTANT:
         *
         * service_requests.customer_id is a FOREIGN KEY
         * referencing customers.id.
         *
         * Therefore, the final customerId used below must
         * always be an actual customers.id.
         */

        Long requestedCustomerId =
                request.getCustomerId();

        Customer customer =
                customerRepository
                        .findById(requestedCustomerId)
                        .orElse(null);

        Long actualCustomerId;

        if (customer != null) {

            // The supplied ID is already customers.id
            actualCustomerId = customer.getId();

        } else {

            /*
             * Sometimes the frontend may send users.id.
             * In that case, find the customer using user_id.
             */

            customer =
                    customerRepository
                            .findByUserId(requestedCustomerId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Customer not found. " +
                                            "ID " +
                                            requestedCustomerId +
                                            " does not exist in customers.id " +
                                            "or customers.user_id."
                                    )
                            );

            actualCustomerId = customer.getId();
        }

        // =================================================
        // CREATE ENTITY
        // =================================================

        ServiceRequest serviceRequest =
                new ServiceRequest();

        // =================================================
        // CUSTOMER
        // =================================================

        serviceRequest.setCustomerId(
                actualCustomerId
        );

        // =================================================
        // TITLE
        // =================================================

        if (request.getTitle() == null ||
                request.getTitle().isBlank()) {

            throw new RuntimeException(
                    "Service request title is required"
            );
        }

        serviceRequest.setTitle(
                request.getTitle().trim()
        );

        // =================================================
        // SERVICE TYPE
        // =================================================

        serviceRequest.setServiceType(
                request.getServiceType()
        );

        // =================================================
        // PRIORITY
        // =================================================

        if (request.getPriority() != null &&
                !request.getPriority().isBlank()) {

            try {

                serviceRequest.setPriority(
                        ServiceRequest.Priority.valueOf(
                                request.getPriority()
                                        .trim()
                                        .toUpperCase()
                        )
                );

            } catch (IllegalArgumentException e) {

                throw new RuntimeException(
                        "Invalid priority: " +
                                request.getPriority()
                );
            }

        } else {

            serviceRequest.setPriority(
                    ServiceRequest.Priority.MEDIUM
            );
        }

        // =================================================
        // PREFERRED DATE
        // =================================================

        serviceRequest.setPreferredDate(
                request.getPreferredDate()
        );

        // =================================================
        // SERVICE LOCATION
        // =================================================

        serviceRequest.setServiceLocation(
                request.getServiceLocation()
        );

        // =================================================
        // DESCRIPTION
        // =================================================

        serviceRequest.setDescription(
                request.getDescription()
        );

        // =================================================
        // STATUS
        // =================================================

        serviceRequest.setStatus(
                ServiceRequest.Status.NEW
        );

        // =================================================
        // CREATED AT
        // =================================================

        serviceRequest.setCreatedAt(
                LocalDateTime.now()
        );

        // =================================================
        // SAVE
        // =================================================

        return serviceRequestRepository.save(
                serviceRequest
        );
    }
}