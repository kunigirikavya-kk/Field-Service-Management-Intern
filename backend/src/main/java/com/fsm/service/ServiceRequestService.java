package com.fsm.service;

import com.fsm.dto.ServiceRequestRequest;
import com.fsm.entity.ServiceRequest;
import com.fsm.repository.ServiceRequestRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;

    // ==============================
    // CONSTRUCTOR
    // ==============================

    public ServiceRequestService(
            ServiceRequestRepository serviceRequestRepository) {

        this.serviceRequestRepository =
                serviceRequestRepository;
    }

    // ==============================
    // GET ALL SERVICE REQUESTS
    // ==============================

    public List<ServiceRequest> getAllServiceRequests() {

        return serviceRequestRepository.findAll();
    }

    // ==============================
    // GET SERVICE REQUEST BY ID
    // ==============================

    public ServiceRequest getServiceRequestById(Long id) {

        return serviceRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Service request not found with id: " + id
                        )
                );
    }

    // ==============================
    // CREATE SERVICE REQUEST
    // ==============================

    public ServiceRequest createServiceRequest(
            ServiceRequestRequest request) {

        ServiceRequest serviceRequest =
                new ServiceRequest();

        // ==============================
        // CUSTOMER
        // ==============================

        serviceRequest.setCustomerId(
                request.getCustomerId()
        );

        // ==============================
        // TITLE
        // ==============================

        serviceRequest.setTitle(
                request.getTitle()
        );

        // ==============================
        // SERVICE TYPE
        // ==============================

        serviceRequest.setServiceType(
                request.getServiceType()
        );

        // ==============================
        // PRIORITY
        // ==============================

        if (request.getPriority() != null &&
                !request.getPriority().isBlank()) {

            serviceRequest.setPriority(
                    ServiceRequest.Priority.valueOf(
                            request.getPriority().toUpperCase()
                    )
            );
        }

        // ==============================
        // PREFERRED DATE
        // ==============================

        serviceRequest.setPreferredDate(
                request.getPreferredDate()
        );

        // ==============================
        // SERVICE LOCATION
        // ==============================

        serviceRequest.setServiceLocation(
                request.getServiceLocation()
        );

        // ==============================
        // DESCRIPTION
        // ==============================

        serviceRequest.setDescription(
                request.getDescription()
        );

        // ==============================
        // DEFAULT STATUS
        // ==============================

        serviceRequest.setStatus(
                ServiceRequest.Status.NEW
        );

        // ==============================
        // CREATED TIME
        // ==============================

        serviceRequest.setCreatedAt(
                LocalDateTime.now()
        );

        // ==============================
        // SAVE
        // ==============================

        return serviceRequestRepository.save(
                serviceRequest
        );
    }
}