package com.fsm.service;

import com.fsm.entity.InventoryPart;
import com.fsm.entity.PartUsage;
import com.fsm.repository.InventoryRepository;
import com.fsm.repository.PartUsageRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PartUsageService {

    private final PartUsageRepository partUsageRepository;
    private final InventoryRepository inventoryRepository;
    private final AuthorizationService authorizationService;

    public PartUsageService(
            PartUsageRepository partUsageRepository,
            InventoryRepository inventoryRepository,
            AuthorizationService authorizationService) {

        this.partUsageRepository = partUsageRepository;
        this.inventoryRepository = inventoryRepository;
        this.authorizationService = authorizationService;
    }

    // ==============================
    // GET PART USAGE BY WORK ORDER
    // ==============================

    public List<PartUsage> getByWorkOrder(Long workOrderId) {
        return partUsageRepository.findByWorkOrderId(workOrderId);
    }

    // ==============================
    // GET PART USAGE BY JOB EXECUTION
    // ==============================

    public List<PartUsage> getByJobExecution(Long jobExecutionId) {
        return partUsageRepository.findByJobExecutionId(jobExecutionId);
    }

    // ==============================
    // GET PART USAGE BY TECHNICIAN
    // ==============================

    public List<PartUsage> getByTechnician(Long technicianId) {

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (!authorizationService.isCurrentTechnician(technicianId)) {
                throw new RuntimeException(
                        "You are not allowed to view another technician's part usage."
                );
            }
        }

        return partUsageRepository.findByTechnicianId(technicianId);
    }

    // ==============================
    // RECORD PART USAGE
    // ==============================

    @Transactional
    public PartUsage recordPartUsage(PartUsage usage) {

        // ------------------------------
        // Validate technician
        // ------------------------------

        if (usage.getTechnicianId() == null) {
            throw new RuntimeException("Technician ID is required.");
        }

        if (authorizationService.hasRole("TECHNICIAN")) {

            if (!authorizationService.isCurrentTechnician(
                    usage.getTechnicianId())) {

                throw new RuntimeException(
                        "You are not allowed to record parts for another technician's job."
                );
            }
        }

        // ------------------------------
        // Validate inventory part
        // ------------------------------

        if (usage.getInventoryPartId() == null) {
            throw new RuntimeException("Inventory part ID is required.");
        }

        InventoryPart part = inventoryRepository
                .findById(usage.getInventoryPartId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory part not found with id: "
                                        + usage.getInventoryPartId()
                        )
                );

        // ------------------------------
        // Validate quantity
        // ------------------------------

        if (usage.getQuantityUsed() == null ||
                usage.getQuantityUsed() <= 0) {

            throw new RuntimeException(
                    "Quantity used must be greater than zero."
            );
        }

        // ------------------------------
        // Check available stock
        // ------------------------------

        if (usage.getQuantityUsed() > part.getQuantity()) {

            throw new RuntimeException(
                    "Insufficient stock. Available quantity: "
                            + part.getQuantity()
            );
        }

        // ------------------------------
        // Set unit price
        // ------------------------------

        usage.setUnitPrice(part.getUnitPrice());

        // ------------------------------
        // Calculate total cost
        // ------------------------------

        BigDecimal totalCost =
                part.getUnitPrice().multiply(
                        BigDecimal.valueOf(
                                usage.getQuantityUsed()
                        )
                );

        usage.setTotalCost(totalCost);

        // ------------------------------
        // Set usage time
        // ------------------------------

        if (usage.getUsedAt() == null) {
            usage.setUsedAt(
                    java.time.LocalDateTime.now()
            );
        }

        // ------------------------------
        // Deduct inventory
        // ------------------------------

        int remainingStock =
                part.getQuantity()
                        - usage.getQuantityUsed();

        part.setQuantity(remainingStock);

        inventoryRepository.save(part);

        // ------------------------------
        // Save part usage record
        // ------------------------------

        return partUsageRepository.save(usage);
    }

    // ==============================
    // DELETE PART USAGE
    // ==============================

    @Transactional
    public void deletePartUsage(Long id) {

        PartUsage usage = partUsageRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Part usage not found with id: " + id
                        )
                );

        // Restore inventory when usage is deleted

        InventoryPart part = inventoryRepository
                .findById(usage.getInventoryPartId())
                .orElse(null);

        if (part != null) {

            part.setQuantity(
                    part.getQuantity()
                            + usage.getQuantityUsed()
            );

            inventoryRepository.save(part);
        }

        partUsageRepository.deleteById(id);
    }
}