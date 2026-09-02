package com.fsm.controller;

import com.fsm.dto.CustomerRequest;
import com.fsm.entity.Customer;
import com.fsm.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:5174")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(
            CustomerService customerService
    ) {
        this.customerService = customerService;
    }

    // =====================================================
    // GET ALL CUSTOMERS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(
                customerService.getAllCustomers()
        );
    }

    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                customerService.getCustomerById(id)
        );
    }

    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @Valid @RequestBody CustomerRequest request
    ) {

        Customer customer = new Customer();

        /*
         * Dispatcher-created customers do not need
         * a user account at this stage.
         *
         * Therefore userId remains NULL.
         */

        customer.setUserId(null);

        customer.setCompanyName(
                request.getCompanyName()
        );

        customer.setContactPerson(
                request.getContactPerson()
        );

        customer.setEmail(
                request.getEmail()
        );

        customer.setPhone(
                request.getPhone()
        );

        customer.setAddress(
                request.getAddress()
        );

        customer.setCity(
                request.getCity()
        );

        customer.setState(
                request.getState()
        );

        customer.setZipCode(
                request.getZipCode()
        );

        Customer savedCustomer =
                customerService.createCustomer(customer);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedCustomer);
    }

    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request
    ) {

        Customer customer = new Customer();

        customer.setCompanyName(
                request.getCompanyName()
        );

        customer.setContactPerson(
                request.getContactPerson()
        );

        customer.setEmail(
                request.getEmail()
        );

        customer.setPhone(
                request.getPhone()
        );

        customer.setAddress(
                request.getAddress()
        );

        customer.setCity(
                request.getCity()
        );

        customer.setState(
                request.getState()
        );

        customer.setZipCode(
                request.getZipCode()
        );

        return ResponseEntity.ok(
                customerService.updateCustomer(
                        id,
                        customer
                )
        );
    }

    // =====================================================
    // DELETE CUSTOMER
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable Long id
    ) {

        customerService.deleteCustomer(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}