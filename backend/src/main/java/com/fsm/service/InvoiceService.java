package com.fsm.service;

import com.fsm.entity.Invoice;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.InvoiceRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final WorkOrderRepository workOrderRepository;
    private final AuthorizationService authorizationService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            WorkOrderRepository workOrderRepository,
            AuthorizationService authorizationService) {

        this.invoiceRepository = invoiceRepository;
        this.workOrderRepository = workOrderRepository;
        this.authorizationService = authorizationService;
    }

    // =========================================================
    // AUTHORIZATION HELPERS
    // =========================================================

    private void requireInvoiceAccess() {

        if (!authorizationService.hasRole("DISPATCHER") &&
            !authorizationService.hasRole("MANAGER")) {

            throw new AccessDeniedException(
                    "You don't have permission to access invoices"
            );
        }
    }

    private void requireInvoiceManagement() {

        if (!authorizationService.hasRole("DISPATCHER") &&
            !authorizationService.hasRole("MANAGER")) {

            throw new AccessDeniedException(
                    "Only Dispatcher or Manager can manage invoices"
            );
        }
    }

    // =========================================================
    // GET ALL INVOICES
    // =========================================================

    public List<Invoice> getAllInvoices() {

        requireInvoiceAccess();

        return invoiceRepository.findAll();
    }

    // =========================================================
    // GET INVOICE BY ID
    // =========================================================

    public Invoice getInvoiceById(Long id) {

        requireInvoiceAccess();

        if (id == null) {
            throw new RuntimeException("Invoice ID is required");
        }

        return invoiceRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Invoice not found with id: " + id
                        )
                );
    }

    // =========================================================
    // CREATE INVOICE
    // =========================================================

    @Transactional
    public Invoice createInvoice(Invoice invoice) {

        requireInvoiceManagement();

        if (invoice == null) {
            throw new RuntimeException("Invoice data is required");
        }

        if (invoice.getWorkOrderId() == null) {
            throw new RuntimeException("Work Order ID is required");
        }

        if (invoice.getCustomerId() == null) {
            throw new RuntimeException("Customer ID is required");
        }

        // ---------------------------------------------------------
        // Validate work order
        // ---------------------------------------------------------

        WorkOrder workOrder =
                workOrderRepository.findById(invoice.getWorkOrderId())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Work order not found with id: "
                                                + invoice.getWorkOrderId()
                                )
                        );

        // ---------------------------------------------------------
        // Prevent invoices for cancelled work orders
        // ---------------------------------------------------------

        if (workOrder.getStatus() == WorkOrder.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cannot create an invoice for a cancelled work order"
            );
        }

        // ---------------------------------------------------------
        // Customer must match work order
        // ---------------------------------------------------------

        if (workOrder.getCustomerId() == null ||
            !workOrder.getCustomerId().equals(invoice.getCustomerId())) {

            throw new RuntimeException(
                    "Invoice customer does not match the work order customer"
            );
        }

        // ---------------------------------------------------------
        // Prevent duplicate invoice for same work order
        // ---------------------------------------------------------

        if (!invoiceRepository
                .findByWorkOrderId(invoice.getWorkOrderId())
                .isEmpty()) {

            throw new RuntimeException(
                    "An invoice already exists for this work order"
            );
        }

        // ---------------------------------------------------------
        // Generate invoice number
        // ---------------------------------------------------------

        if (invoice.getInvoiceNumber() == null ||
            invoice.getInvoiceNumber().trim().isEmpty()) {

            invoice.setInvoiceNumber(
                    "INV-" + System.currentTimeMillis()
            );
        }

        // ---------------------------------------------------------
        // Validate amounts
        // ---------------------------------------------------------

        BigDecimal serviceAmount =
                invoice.getServiceAmount() == null
                        ? BigDecimal.ZERO
                        : invoice.getServiceAmount();

        BigDecimal taxAmount =
                invoice.getTaxAmount() == null
                        ? BigDecimal.ZERO
                        : invoice.getTaxAmount();

        if (serviceAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Service amount cannot be negative"
            );
        }

        if (taxAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Tax amount cannot be negative"
            );
        }

        invoice.setServiceAmount(serviceAmount);
        invoice.setTaxAmount(taxAmount);

        // ---------------------------------------------------------
        // Calculate total on backend
        // ---------------------------------------------------------

        invoice.setTotalAmount(
                serviceAmount.add(taxAmount)
        );

        // ---------------------------------------------------------
        // Default status
        // ---------------------------------------------------------

        if (invoice.getStatus() == null) {

            invoice.setStatus(
                    Invoice.Status.UNPAID
            );
        }

        // ---------------------------------------------------------
        // New invoice cannot start as PAID without payment date
        // ---------------------------------------------------------

        if (invoice.getStatus() == Invoice.Status.PAID) {

            if (invoice.getPaymentDate() == null) {

                throw new RuntimeException(
                        "Paid invoice must have a payment date"
                );
            }

        } else {

            invoice.setPaymentDate(null);
        }

        // ---------------------------------------------------------
        // Invoice date
        // ---------------------------------------------------------

        if (invoice.getInvoiceDate() == null) {

            invoice.setInvoiceDate(
                    LocalDateTime.now()
            );
        }

        // ---------------------------------------------------------
        // Due date validation
        // ---------------------------------------------------------

        if (invoice.getDueDate() != null &&
            invoice.getDueDate()
                    .isBefore(invoice.getInvoiceDate())) {

            throw new RuntimeException(
                    "Due date cannot be before invoice date"
            );
        }

        return invoiceRepository.save(invoice);
    }

    // =========================================================
    // UPDATE INVOICE
    // =========================================================

    @Transactional
    public Invoice updateInvoice(
            Long id,
            Invoice updatedInvoice) {

        requireInvoiceManagement();

        if (id == null) {
            throw new RuntimeException("Invoice ID is required");
        }

        if (updatedInvoice == null) {
            throw new RuntimeException("Invoice data is required");
        }

        Invoice existing =
                invoiceRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invoice not found with id: " + id
                                )
                        );

        // ---------------------------------------------------------
        // Finalized invoices cannot be edited
        // ---------------------------------------------------------

        if (existing.getStatus() == Invoice.Status.PAID) {

            throw new RuntimeException(
                    "Paid invoices cannot be edited"
            );
        }

        if (existing.getStatus() == Invoice.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cancelled invoices cannot be edited"
            );
        }

        // ---------------------------------------------------------
        // Work order is required
        // ---------------------------------------------------------

        if (updatedInvoice.getWorkOrderId() == null) {

            throw new RuntimeException(
                    "Work Order ID is required"
            );
        }

        if (updatedInvoice.getCustomerId() == null) {

            throw new RuntimeException(
                    "Customer ID is required"
            );
        }

        WorkOrder workOrder =
                workOrderRepository.findById(
                        updatedInvoice.getWorkOrderId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Work order not found with id: "
                                        + updatedInvoice.getWorkOrderId()
                        )
                );

        if (workOrder.getStatus() == WorkOrder.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cannot associate an invoice with a cancelled work order"
            );
        }

        // ---------------------------------------------------------
        // Validate customer/work-order relationship
        // ---------------------------------------------------------

        if (workOrder.getCustomerId() == null ||
            !workOrder.getCustomerId()
                    .equals(updatedInvoice.getCustomerId())) {

            throw new RuntimeException(
                    "Invoice customer does not match the work order customer"
            );
        }

        // ---------------------------------------------------------
        // If work order changes, prevent duplicate invoice
        // ---------------------------------------------------------

        if (!existing.getWorkOrderId()
                .equals(updatedInvoice.getWorkOrderId())) {

            if (!invoiceRepository
                    .findByWorkOrderId(
                            updatedInvoice.getWorkOrderId()
                    ).isEmpty()) {

                throw new RuntimeException(
                        "An invoice already exists for this work order"
                );
            }
        }

        // ---------------------------------------------------------
        // Validate amounts
        // ---------------------------------------------------------

        BigDecimal serviceAmount =
                updatedInvoice.getServiceAmount() == null
                        ? BigDecimal.ZERO
                        : updatedInvoice.getServiceAmount();

        BigDecimal taxAmount =
                updatedInvoice.getTaxAmount() == null
                        ? BigDecimal.ZERO
                        : updatedInvoice.getTaxAmount();

        if (serviceAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Service amount cannot be negative"
            );
        }

        if (taxAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Tax amount cannot be negative"
            );
        }

        // ---------------------------------------------------------
        // Update editable fields
        // ---------------------------------------------------------

        existing.setWorkOrderId(
                updatedInvoice.getWorkOrderId()
        );

        existing.setCustomerId(
                updatedInvoice.getCustomerId()
        );

        existing.setDueDate(
                updatedInvoice.getDueDate()
        );

        existing.setServiceAmount(
                serviceAmount
        );

        existing.setTaxAmount(
                taxAmount
        );

        existing.setTotalAmount(
                serviceAmount.add(taxAmount)
        );

        existing.setNotes(
                updatedInvoice.getNotes()
        );

        // ---------------------------------------------------------
        // Due date validation
        // ---------------------------------------------------------

        if (existing.getDueDate() != null &&
            existing.getInvoiceDate() != null &&
            existing.getDueDate()
                    .isBefore(existing.getInvoiceDate())) {

            throw new RuntimeException(
                    "Due date cannot be before invoice date"
            );
        }

        return invoiceRepository.save(existing);
    }

    // =========================================================
    // MARK AS PAID
    // =========================================================

    @Transactional
    public Invoice markAsPaid(Long id) {

        requireInvoiceManagement();

        Invoice invoice = getInvoiceForManagement(id);

        if (invoice.getStatus() == Invoice.Status.PAID) {

            throw new RuntimeException(
                    "Invoice is already paid"
            );
        }

        if (invoice.getStatus() == Invoice.Status.CANCELLED) {

            throw new RuntimeException(
                    "Cancelled invoices cannot be marked as paid"
            );
        }

        invoice.setStatus(
                Invoice.Status.PAID
        );

        invoice.setPaymentDate(
                LocalDateTime.now()
        );

        return invoiceRepository.save(invoice);
    }

    // =========================================================
    // CANCEL INVOICE
    // =========================================================

    @Transactional
    public Invoice cancelInvoice(Long id) {

        requireInvoiceManagement();

        Invoice invoice = getInvoiceForManagement(id);

        if (invoice.getStatus() == Invoice.Status.PAID) {

            throw new RuntimeException(
                    "Paid invoices cannot be cancelled"
            );
        }

        if (invoice.getStatus() == Invoice.Status.CANCELLED) {

            throw new RuntimeException(
                    "Invoice is already cancelled"
            );
        }

        invoice.setStatus(
                Invoice.Status.CANCELLED
        );

        invoice.setPaymentDate(null);

        return invoiceRepository.save(invoice);
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Transactional
    public void deleteInvoice(Long id) {

        requireInvoiceManagement();

        Invoice invoice = getInvoiceForManagement(id);

        if (invoice.getStatus() == Invoice.Status.PAID) {

            throw new RuntimeException(
                    "Paid invoices cannot be deleted"
            );
        }

        invoiceRepository.delete(invoice);
    }

    // =========================================================
    // CUSTOMER INVOICES
    // =========================================================

    public List<Invoice> getByCustomer(
            Long customerId) {

        requireInvoiceAccess();

        if (customerId == null) {

            throw new RuntimeException(
                    "Customer ID is required"
            );
        }

        return invoiceRepository
                .findByCustomerId(customerId);
    }

    // =========================================================
    // WORK ORDER INVOICES
    // =========================================================

    public List<Invoice> getByWorkOrder(
            Long workOrderId) {

        requireInvoiceAccess();

        if (workOrderId == null) {

            throw new RuntimeException(
                    "Work Order ID is required"
            );
        }

        // Make sure work order actually exists
        if (!workOrderRepository.existsById(workOrderId)) {

            throw new RuntimeException(
                    "Work order not found with id: " + workOrderId
            );
        }

        return invoiceRepository
                .findByWorkOrderId(workOrderId);
    }

    // =========================================================
    // STATUS
    // =========================================================

    public List<Invoice> getByStatus(
            Invoice.Status status) {

        requireInvoiceAccess();

        if (status == null) {

            throw new RuntimeException(
                    "Invoice status is required"
            );
        }

        return invoiceRepository
                .findByStatus(status);
    }

    // =========================================================
    // INTERNAL HELPER
    // =========================================================

    private Invoice getInvoiceForManagement(Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "Invoice ID is required"
            );
        }

        return invoiceRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Invoice not found with id: " + id
                        )
                );
    }
}