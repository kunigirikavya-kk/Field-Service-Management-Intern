package com.fsm.dto;

import com.fsm.entity.Priority;
import com.fsm.entity.WorkOrder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WorkOrderResponse {
    private Long id;
    private Long serviceRequestId;
    private Long technicianId;
    private Long customerId;
    private Long siteId;
    private String orderNumber;
    private String title;
    private Priority priority;
    private WorkOrder.ServiceType serviceType;
    private String description;
    private WorkOrder.Status status;
    private LocalDateTime scheduledDate;
    private LocalDateTime completedDate;
    private BigDecimal totalCost;
    private BigDecimal partsCost;
    private Integer labourMinutes;
    private LocalDateTime slaDueAt;
    private boolean slaBreached;
    private LocalDateTime createdAt;

    public static WorkOrderResponse from(WorkOrder o, boolean customerView) {
        WorkOrderResponse r = new WorkOrderResponse();
        r.id=o.getId(); r.serviceRequestId=o.getServiceRequestId(); r.customerId=o.getCustomerId();
        r.siteId=o.getSiteId(); r.orderNumber=o.getOrderNumber(); r.title=o.getTitle();
        r.priority=o.getPriority(); r.serviceType=o.getServiceType(); r.description=o.getDescription();
        r.status=o.getStatus()==WorkOrder.Status.PENDING ? WorkOrder.Status.NEW : o.getStatus();
        r.scheduledDate=o.getScheduledDate(); r.completedDate=o.getCompletedDate(); r.createdAt=o.getCreatedAt();
        if (!customerView) {
            r.technicianId=o.getTechnicianId(); r.totalCost=o.getTotalCost(); r.partsCost=o.getPartsCost();
            r.labourMinutes=o.getLabourMinutes(); r.slaDueAt=o.getSlaDueAt(); r.slaBreached=o.isSlaBreached();
        }
        return r;
    }

    public Long getId(){return id;} public Long getServiceRequestId(){return serviceRequestId;}
    public Long getTechnicianId(){return technicianId;} public Long getCustomerId(){return customerId;}
    public Long getSiteId(){return siteId;} public String getOrderNumber(){return orderNumber;}
    public String getTitle(){return title;} public Priority getPriority(){return priority;}
    public WorkOrder.ServiceType getServiceType(){return serviceType;} public String getDescription(){return description;}
    public WorkOrder.Status getStatus(){return status;} public LocalDateTime getScheduledDate(){return scheduledDate;}
    public LocalDateTime getCompletedDate(){return completedDate;} public BigDecimal getTotalCost(){return totalCost;}
    public BigDecimal getPartsCost(){return partsCost;} public Integer getLabourMinutes(){return labourMinutes;}
    public LocalDateTime getSlaDueAt(){return slaDueAt;} public boolean isSlaBreached(){return slaBreached;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}