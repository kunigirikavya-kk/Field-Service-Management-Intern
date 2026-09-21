package com.fsm.controller;

import com.fsm.entity.Invoice;
import com.fsm.service.InvoiceService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5174")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(
            InvoiceService invoiceService) {

        this.invoiceService = invoiceService;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {

        return ResponseEntity.ok(
                invoiceService.getAllInvoices()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                invoiceService.getInvoiceById(id)
        );
    }

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(
            @RequestBody Invoice invoice) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        invoiceService.createInvoice(invoice)
                );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(
            @PathVariable Long id,
            @RequestBody Invoice invoice) {

        return ResponseEntity.ok(
                invoiceService.updateInvoice(
                        id,
                        invoice
                )
        );
    }

    // =========================================================
    // MARK PAID
    // =========================================================

    @PutMapping("/{id}/pay")
    public ResponseEntity<Invoice> markAsPaid(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                invoiceService.markAsPaid(id)
        );
    }

    // =========================================================
    // CANCEL
    // =========================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Invoice> cancelInvoice(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                invoiceService.cancelInvoice(id)
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(
            @PathVariable Long id) {

        invoiceService.deleteInvoice(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================================================
    // CUSTOMER INVOICES
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Invoice>> getByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                invoiceService.getByCustomer(
                        customerId
                )
        );
    }

    // =========================================================
    // WORK ORDER INVOICES
    // =========================================================

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<Invoice>> getByWorkOrder(
            @PathVariable Long workOrderId) {

        return ResponseEntity.ok(
                invoiceService.getByWorkOrder(
                        workOrderId
                )
        );
    }

    // =========================================================
    // STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Invoice>> getByStatus(
            @PathVariable Invoice.Status status) {

        return ResponseEntity.ok(
                invoiceService.getByStatus(
                        status
                )
        );
    }
}