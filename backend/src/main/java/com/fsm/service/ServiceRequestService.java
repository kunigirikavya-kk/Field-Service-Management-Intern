// ServiceRequestService.java

package com.fsm.service;

import com.fsm.dto.ServiceRequestRequest;
import com.fsm.entity.Customer;
import com.fsm.entity.ServiceRequest;
import com.fsm.repository.CustomerRepository;
import com.fsm.repository.ServiceRequestRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final CustomerRepository customerRepository;
    private final AuthorizationService authorizationService;

    public ServiceRequestService(
            ServiceRequestRepository serviceRequestRepository,
            CustomerRepository customerRepository,
            AuthorizationService authorizationService) {

        this.serviceRequestRepository = serviceRequestRepository;
        this.customerRepository = customerRepository;
        this.authorizationService = authorizationService;
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

        ServiceRequest serviceRequest =
                serviceRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Service request not found with id: "
                                                + id
                                )
                        );

        /*
         * =================================================
         * CUSTOMER OWNERSHIP SECURITY
         * =================================================
         *
         * Dispatcher and Manager can view any service
         * request.
         *
         * Customer can view ONLY their own service
         * requests.
         *
         * Technician cannot reach this method because
         * SecurityConfig blocks the request.
         */

        if (authorizationService.hasRole("CUSTOMER")) {

            Long loggedInCustomerId =
                    authorizationService
                            .getCurrentCustomerId();

            if (!loggedInCustomerId.equals(
                    serviceRequest.getCustomerId()
            )) {

                throw new AccessDeniedException(
                        "Customers can view only their own service requests."
                );
            }
        }

        return serviceRequest;
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

        if (!authorizationService.hasRole("CUSTOMER")
                && !authorizationService.hasRole("DISPATCHER")
                && !authorizationService.hasRole("MANAGER")) {
            throw new AccessDeniedException(
                    "Only customers, dispatchers, and managers can create service requests."
            );
        }


        /*
         * =================================================
         * CUSTOMER OWNERSHIP SECURITY
         * =================================================
         *
         * CUSTOMER users are allowed to create service
         * requests only for their own customer account.
         *
         * We must NEVER trust customerId supplied by the
         * frontend because a user could manually change it.
         *
         * Example:
         *
         * Logged-in customer = 17
         * Request customerId = 16
         *
         * Result:
         * 403 Forbidden
         *
         * DISPATCHER and MANAGER are allowed to create
         * requests for other customers.
         */

        Long requestedCustomerId = request.getCustomerId();

        Long actualCustomerId;
        Customer customer;

        if (authorizationService.hasRole("CUSTOMER")) {
            /*
             * Never trust customerId sent by the browser for a CUSTOMER.
             * Resolve the customer from the authenticated JWT/user instead.
             * This also avoids the users.id vs customers.id ambiguity.
             */
            actualCustomerId = authorizationService.getCurrentCustomerId();
            customer = customerRepository.findById(actualCustomerId)
                    .orElseThrow(() -> new RuntimeException(
                            "Customer profile not found for the authenticated user."
                    ));
        } else {
            /*
             * DISPATCHER and MANAGER may create a request for any customer.
             * Their form supplies customers.id.
             */
            customer = customerRepository.findById(requestedCustomerId)
                    .orElseThrow(() -> new RuntimeException(
                            "Customer not found with id: " + requestedCustomerId
                    ));
            actualCustomerId = customer.getId();
        }

        // =================================================
        // ENFORCE CUSTOMER OWNERSHIP
        // =================================================

        // CUSTOMER ownership is already enforced by resolving the
        // customer from the authenticated user above. No browser-supplied
        // customer ID can override that identity.

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