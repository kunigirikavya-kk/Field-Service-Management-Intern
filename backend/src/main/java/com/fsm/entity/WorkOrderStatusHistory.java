package com.fsm.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_order_status_history")
public class WorkOrderStatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "work_order_id", nullable = false)
    private Long workOrderId;

    @Column(name = "from_status")
    private String fromStatus;

    @Column(name = "to_status", nullable = false)
    private String toStatus;

    @Column(name = "changed_by_user_id")
    private Long changedByUserId;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @Column(columnDefinition = "TEXT")
    private String note;

    public WorkOrderStatusHistory() {}

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) changedAt = LocalDateTime.now();
    }

    public Long getId(){ return id; }
    public void setId(Long id){ this.id=id; }
    public Long getWorkOrderId(){ return workOrderId; }
    public void setWorkOrderId(Long workOrderId){ this.workOrderId=workOrderId; }
    public String getFromStatus(){ return fromStatus; }
    public void setFromStatus(String fromStatus){ this.fromStatus=fromStatus; }
    public String getToStatus(){ return toStatus; }
    public void setToStatus(String toStatus){ this.toStatus=toStatus; }
    public Long getChangedByUserId(){ return changedByUserId; }
    public void setChangedByUserId(Long changedByUserId){ this.changedByUserId=changedByUserId; }
    public LocalDateTime getChangedAt(){ return changedAt; }
    public void setChangedAt(LocalDateTime changedAt){ this.changedAt=changedAt; }
    public String getNote(){ return note; }
    public void setNote(String note){ this.note=note; }
}