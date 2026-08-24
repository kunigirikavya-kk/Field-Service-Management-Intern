package com.fsm.service;

import com.fsm.entity.Invoice;
import com.fsm.repository.InvoiceRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;


    public InvoiceService(
            InvoiceRepository invoiceRepository) {

        this.invoiceRepository = invoiceRepository;
    }


    // -----------------------------------------
    // GET ALL INVOICES
    // -----------------------------------------

    public List<Invoice> getAllInvoices() {

        return invoiceRepository.findAll();
    }


    // -----------------------------------------
    // GET INVOICE BY ID
    // -----------------------------------------

    public Invoice getInvoiceById(Long id) {

        return invoiceRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Invoice not found with id: " + id
                        )
                );
    }


    // -----------------------------------------
// CREATE INVOICE
// -----------------------------------------

public Invoice createInvoice(Invoice invoice) {

    // Generate invoice number automatically
    if (invoice.getInvoiceNumber() == null ||
            invoice.getInvoiceNumber().trim().isEmpty()) {

        invoice.setInvoiceNumber(
                "INV-" + System.currentTimeMillis()
        );
    }

    // Service amount
    BigDecimal serviceAmount =
            invoice.getServiceAmount() == null
                    ? BigDecimal.ZERO
                    : invoice.getServiceAmount();

    // Tax amount
    BigDecimal taxAmount =
            invoice.getTaxAmount() == null
                    ? BigDecimal.ZERO
                    : invoice.getTaxAmount();

    invoice.setServiceAmount(serviceAmount);

    invoice.setTaxAmount(taxAmount);

    // Calculate total
    invoice.setTotalAmount(
            serviceAmount.add(taxAmount)
    );

    // Default status
    if (invoice.getStatus() == null) {

        invoice.setStatus(
                Invoice.Status.UNPAID
        );
    }

    // Invoice date
    if (invoice.getInvoiceDate() == null) {

        invoice.setInvoiceDate(
                LocalDateTime.now()
        );
    }

    return invoiceRepository.save(invoice);
}

    // -----------------------------------------
    // UPDATE INVOICE
    // -----------------------------------------

    public Invoice updateInvoice(
            Long id,
            Invoice updatedInvoice) {

        Invoice existing =
                getInvoiceById(id);


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
                updatedInvoice.getServiceAmount()
        );

        existing.setTaxAmount(
                updatedInvoice.getTaxAmount()
        );

        existing.setNotes(
                updatedInvoice.getNotes()
        );


        BigDecimal serviceAmount =
                updatedInvoice.getServiceAmount() == null
                        ? BigDecimal.ZERO
                        : updatedInvoice.getServiceAmount();

        BigDecimal taxAmount =
                updatedInvoice.getTaxAmount() == null
                        ? BigDecimal.ZERO
                        : updatedInvoice.getTaxAmount();


        existing.setTotalAmount(
                serviceAmount.add(taxAmount)
        );


        return invoiceRepository.save(existing);
    }


    // -----------------------------------------
    // MARK AS PAID
    // -----------------------------------------

    public Invoice markAsPaid(Long id) {

        Invoice invoice =
                getInvoiceById(id);


        invoice.setStatus(
                Invoice.Status.PAID
        );

        invoice.setPaymentDate(
                LocalDateTime.now()
        );


        return invoiceRepository.save(invoice);
    }


    // -----------------------------------------
    // CANCEL INVOICE
    // -----------------------------------------

    public Invoice cancelInvoice(Long id) {

        Invoice invoice =
                getInvoiceById(id);


        invoice.setStatus(
                Invoice.Status.CANCELLED
        );


        return invoiceRepository.save(invoice);
    }


    // -----------------------------------------
    // DELETE
    // -----------------------------------------

    public void deleteInvoice(Long id) {

        if (!invoiceRepository.existsById(id)) {

            throw new RuntimeException(
                    "Invoice not found with id: " + id
            );
        }


        invoiceRepository.deleteById(id);
    }


    // -----------------------------------------
    // CUSTOMER INVOICES
    // -----------------------------------------

    public List<Invoice> getByCustomer(
            Long customerId) {

        return invoiceRepository
                .findByCustomerId(customerId);
    }


    // -----------------------------------------
    // WORK ORDER INVOICES
    // -----------------------------------------

    public List<Invoice> getByWorkOrder(
            Long workOrderId) {

        return invoiceRepository
                .findByWorkOrderId(workOrderId);
    }


    // -----------------------------------------
    // STATUS
    // -----------------------------------------

    public List<Invoice> getByStatus(
            Invoice.Status status) {

        return invoiceRepository
                .findByStatus(status);
    }
}