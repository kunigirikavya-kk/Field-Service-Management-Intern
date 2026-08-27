package com.fsm.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==============================
    // CUSTOMER
    // ==============================

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    // ==============================
    // SERVICE REQUEST TITLE
    // ==============================

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    // ==============================
    // SERVICE DETAILS
    // ==============================

    @Column(name = "service_type", nullable = false)
    private String serviceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Column(name = "service_location")
    private String serviceLocation;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ==============================
    // STATUS
    // ==============================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.NEW;

    // ==============================
    // CREATED DATE
    // ==============================

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ==============================
    // ENUMS
    // ==============================

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    public enum Status {
        NEW,
        ASSIGNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    // ==============================
    // CONSTRUCTOR
    // ==============================

    public ServiceRequest() {
    }

    // ==============================
    // GETTERS AND SETTERS
    // ==============================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}