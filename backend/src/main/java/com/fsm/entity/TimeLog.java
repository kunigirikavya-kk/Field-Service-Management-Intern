package com.fsm.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "time_logs")
public class TimeLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="work_order_id", nullable=false)
    private Long workOrderId;

    @Column(name="technician_id", nullable=false)
    private Long technicianId;

    @Column(nullable=false)
    private Integer minutes;

    @Column(columnDefinition="TEXT")
    private String note;

    @Column(name="logged_at", nullable=false)
    private LocalDateTime loggedAt;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;

    public TimeLog() {}

    @PrePersist
    protected void onCreate() {
        if (loggedAt == null) loggedAt = LocalDateTime.now();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId(){return id;}
    public void setId(Long id){this.id=id;}
    public Long getWorkOrderId(){return workOrderId;}
    public void setWorkOrderId(Long id){this.workOrderId=id;}
    public Long getTechnicianId(){return technicianId;}
    public void setTechnicianId(Long id){this.technicianId=id;}
    public Integer getMinutes(){return minutes;}
    public void setMinutes(Integer minutes){this.minutes=minutes;}
    public String getNote(){return note;}
    public void setNote(String note){this.note=note;}
    public LocalDateTime getLoggedAt(){return loggedAt;}
    public void setLoggedAt(LocalDateTime value){this.loggedAt=value;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setCreatedAt(LocalDateTime value){this.createdAt=value;}
}