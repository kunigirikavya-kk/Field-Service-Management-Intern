package com.fsm.controller;

import com.fsm.entity.WorkOrderStatusHistory;
import com.fsm.service.WorkOrderStatusHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderHistoryController {
    private final WorkOrderStatusHistoryService service;
    public WorkOrderHistoryController(WorkOrderStatusHistoryService service){this.service=service;}

    @GetMapping("/{workOrderId}/history")
    public ResponseEntity<List<WorkOrderStatusHistory>> history(@PathVariable Long workOrderId){
        return ResponseEntity.ok(service.getHistory(workOrderId));
    }
}