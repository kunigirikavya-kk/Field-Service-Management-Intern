package com.fsm.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

@Entity
@Table(name = "job_photos")
public class JobPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_execution_id")
    private Long jobExecutionId;

    @Column(name = "service_request_id")
    private Long serviceRequestId;

    @Column(name = "work_order_id")
    private Long workOrderId;

    @Column(name = "technician_id")
    private Long technicianId;

    @Column(
            name = "image_url",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String imageUrl;

    @Column(name = "public_id")
    private String publicId;

    @Enumerated(EnumType.STRING)
    @Column(name = "photo_type", nullable = false, length = 30)
    private PhotoType photoType = PhotoType.WORK_COMPLETION;

    public enum PhotoType {
        CUSTOMER_REQUEST("Customer Request"),
        WORK_COMPLETION("Technician Work");
        private final String label;
        PhotoType(String label) { this.label = label; }
        @JsonValue public String toJson() { return name(); }
        @JsonCreator public static PhotoType fromJson(String value) {
            if (value == null) return null;
            for (PhotoType type : values()) {
                if (type.name().equalsIgnoreCase(value) || type.label.equalsIgnoreCase(value)) return type;
            }
            throw new IllegalArgumentException("Invalid photo type: " + value);
        }
    }

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;


    @PrePersist
    protected void onCreate() {

        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }


    public JobPhoto() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getJobExecutionId() {
        return jobExecutionId;
    }

    public void setJobExecutionId(
            Long jobExecutionId
    ) {
        this.jobExecutionId =
                jobExecutionId;
    }


    public Long getServiceRequestId() { return serviceRequestId; }
    public void setServiceRequestId(Long serviceRequestId) { this.serviceRequestId = serviceRequestId; }
    public PhotoType getPhotoType() { return photoType; }
    public void setPhotoType(PhotoType photoType) { this.photoType = photoType; }

    public Long getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(
            Long workOrderId
    ) {
        this.workOrderId =
                workOrderId;
    }


    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(
            Long technicianId
    ) {
        this.technicianId =
                technicianId;
    }


    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(
            String imageUrl
    ) {
        this.imageUrl =
                imageUrl;
    }


    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(
            String publicId
    ) {
        this.publicId =
                publicId;
    }


    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(
            LocalDateTime uploadedAt
    ) {
        this.uploadedAt =
                uploadedAt;
    }
}