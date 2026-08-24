package com.fsm.repository;

import com.fsm.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(
            String invoiceNumber
    );

    List<Invoice> findByCustomerId(
            Long customerId
    );

    List<Invoice> findByWorkOrderId(
            Long workOrderId
    );

    List<Invoice> findByStatus(
            Invoice.Status status
    );
}