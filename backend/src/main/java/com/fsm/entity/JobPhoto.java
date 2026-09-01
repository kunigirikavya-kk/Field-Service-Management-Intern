package com.fsm.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_photos")
public class JobPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_execution_id")
    private Long jobExecutionId;

    @Column(name = "work_order_id", nullable = false)
    private Long workOrderId;

    @Column(name = "technician_id", nullable = false)
    private Long technicianId;

    @Column(
            name = "image_url",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String imageUrl;

    @Column(name = "public_id")
    private String publicId;

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