package com.fsm.dto;

import java.time.LocalDate;

public class ServiceRequestRequest {

    private Long customerId;

    private String serviceType;

    private String priority;
    private String title;
    private LocalDate preferredDate;

    private String serviceLocation;

    private String description;


    // ==============================
    // GETTERS AND SETTERS
    // ==============================

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getTitle() {
    return title;
}

public void setTitle(String title) {
    this.title = title;
}

    public LocalDate getPreferredDate() {
        return preferredDate;
    }

    public void setPreferredDate(LocalDate preferredDate) {
        this.preferredDate = preferredDate;
    }

    public String getServiceLocation() {
        return serviceLocation;
    }

    public void setServiceLocation(String serviceLocation) {
        this.serviceLocation = serviceLocation;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}