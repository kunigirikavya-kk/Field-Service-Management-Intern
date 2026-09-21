package com.fsm.service;

import com.fsm.entity.InventoryPart;
import com.fsm.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(
            InventoryRepository inventoryRepository) {

        this.inventoryRepository = inventoryRepository;
    }

    // -----------------------------------------
    // GET ALL INVENTORY PARTS
    // -----------------------------------------

    public List<InventoryPart> getAllParts() {

        return inventoryRepository.findAll();
    }

    // -----------------------------------------
    // GET PART BY ID
    // -----------------------------------------

    public InventoryPart getPartById(Long id) {

        return inventoryRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Inventory part not found with id: " + id
                        )
                );
    }

    // -----------------------------------------
    // CREATE PART
    // -----------------------------------------

    public InventoryPart createPart(
            InventoryPart part) {

        if (part.getPartNumber() == null ||
                part.getPartNumber().trim().isEmpty()) {

            throw new RuntimeException(
                    "Part number is required"
            );
        }

        String partNumber =
                part.getPartNumber().trim();

        if (inventoryRepository.existsByPartNumber(partNumber)) {

            throw new RuntimeException(
                    "Part number already exists: " + partNumber
            );
        }

        part.setPartNumber(partNumber);

        if (part.getPartName() == null ||
                part.getPartName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Part name is required"
            );
        }

        part.setPartName(
                part.getPartName().trim()
        );

        if (part.getQuantity() == null) {
            part.setQuantity(0);
        }

        if (part.getMinimumStock() == null) {
            part.setMinimumStock(0);
        }

        return inventoryRepository.save(part);
    }

    // -----------------------------------------
    // UPDATE PART
    // -----------------------------------------

    public InventoryPart updatePart(
            Long id,
            InventoryPart updatedPart) {

        InventoryPart existing =
                inventoryRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Inventory part not found with id: " + id
                                )
                        );

        if (updatedPart.getPartNumber() == null ||
                updatedPart.getPartNumber().trim().isEmpty()) {

            throw new RuntimeException(
                    "Part number is required"
            );
        }

        String partNumber =
                updatedPart.getPartNumber().trim();

        /*
         * Check whether another inventory part
         * already uses this part number.
         *
         * The current part itself is excluded.
         */
        if (inventoryRepository
                .existsByPartNumberAndIdNot(
                        partNumber,
                        id
                )) {

            throw new RuntimeException(
                    "Part number already exists: " + partNumber
            );
        }

        existing.setPartNumber(partNumber);

        if (updatedPart.getPartName() == null ||
                updatedPart.getPartName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Part name is required"
            );
        }

        existing.setPartName(
                updatedPart.getPartName().trim()
        );

        existing.setCategory(
                updatedPart.getCategory()
        );

        existing.setQuantity(
                updatedPart.getQuantity() != null
                        ? updatedPart.getQuantity()
                        : 0
        );

        existing.setMinimumStock(
                updatedPart.getMinimumStock() != null
                        ? updatedPart.getMinimumStock()
                        : 0
        );

        existing.setUnitPrice(
                updatedPart.getUnitPrice()
        );

        existing.setSupplier(
                updatedPart.getSupplier()
        );

        return inventoryRepository.save(existing);
    }

    // -----------------------------------------
    // DELETE PART
    // -----------------------------------------

    public void deletePart(Long id) {

        if (!inventoryRepository.existsById(id)) {

            throw new RuntimeException(
                    "Inventory part not found with id: " + id
            );
        }

        inventoryRepository.deleteById(id);
    }

    // -----------------------------------------
    // UPDATE STOCK
    // -----------------------------------------

    public InventoryPart updateStock(
            Long id,
            Integer quantity) {

        InventoryPart part =
                inventoryRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Inventory part not found with id: " + id
                                )
                        );

        if (quantity == null || quantity < 0) {

            throw new RuntimeException(
                    "Quantity cannot be negative"
            );
        }

        part.setQuantity(quantity);

        return inventoryRepository.save(part);
    }
}