package com.fsm.controller;

import com.fsm.entity.InventoryPart;
import com.fsm.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:5174")
public class InventoryController {

    private final InventoryService inventoryService;


    public InventoryController(
            InventoryService inventoryService) {

        this.inventoryService = inventoryService;
    }


    // -----------------------------------------
    // GET ALL
    // -----------------------------------------

    @GetMapping
    public ResponseEntity<List<InventoryPart>> getAllParts() {

        return ResponseEntity.ok(
                inventoryService.getAllParts()
        );
    }


    // -----------------------------------------
    // GET BY ID
    // -----------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<InventoryPart> getPartById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inventoryService.getPartById(id)
        );
    }


    // -----------------------------------------
    // CREATE
    // -----------------------------------------

    @PostMapping
    public ResponseEntity<InventoryPart> createPart(
            @RequestBody InventoryPart part) {

        return ResponseEntity.ok(
                inventoryService.createPart(part)
        );
    }


    // -----------------------------------------
    // UPDATE
    // -----------------------------------------

    @PutMapping("/{id}")
    public ResponseEntity<InventoryPart> updatePart(
            @PathVariable Long id,
            @RequestBody InventoryPart part) {

        return ResponseEntity.ok(
                inventoryService.updatePart(id, part)
        );
    }


    // -----------------------------------------
    // DELETE
    // -----------------------------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(
            @PathVariable Long id) {

        inventoryService.deletePart(id);

        return ResponseEntity.noContent().build();
    }


    // -----------------------------------------
    // UPDATE STOCK
    // -----------------------------------------

    @PutMapping("/{id}/stock")
    public ResponseEntity<InventoryPart> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                inventoryService.updateStock(
                        id,
                        quantity
                )
        );
    }
}