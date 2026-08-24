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


        existing.setPartNumber(
                updatedPart.getPartNumber()
        );

        existing.setPartName(
                updatedPart.getPartName()
        );

        existing.setCategory(
                updatedPart.getCategory()
        );

        existing.setQuantity(
                updatedPart.getQuantity()
        );

        existing.setMinimumStock(
                updatedPart.getMinimumStock()
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


        part.setQuantity(quantity);


        return inventoryRepository.save(part);
    }
}