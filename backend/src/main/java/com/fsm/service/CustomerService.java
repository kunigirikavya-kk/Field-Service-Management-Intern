package com.fsm.service;

import com.fsm.entity.Customer;
import com.fsm.repository.CustomerRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AuthorizationService authorizationService;

    public CustomerService(
            CustomerRepository customerRepository,
            AuthorizationService authorizationService
    ) {
        this.customerRepository = customerRepository;
        this.authorizationService = authorizationService;
    }

    // =====================================================
    // GET ALL CUSTOMERS
    // =====================================================

    public List<Customer> getAllCustomers() {

        return customerRepository.findAll();
    }

    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================

    public Customer getCustomerById(Long id) {

        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: " + id
                        )
                );
    }

    // =====================================================
    // GET CURRENT LOGGED-IN CUSTOMER
    // =====================================================

    public Customer getCurrentCustomer() {

        Long customerId =
                authorizationService.getCurrentCustomerId();

        return customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer profile not found for current user"
                        )
                );
    }

    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    public Customer createCustomer(Customer customer) {

        return customerRepository.save(customer);
    }

    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    public Customer updateCustomer(
            Long id,
            Customer customerDetails
    ) {

        Customer customer =
                getCustomerById(id);

        customer.setCompanyName(
                customerDetails.getCompanyName()
        );

        customer.setContactPerson(
                customerDetails.getContactPerson()
        );

        customer.setEmail(
                customerDetails.getEmail()
        );

        customer.setPhone(
                customerDetails.getPhone()
        );

        customer.setAddress(
                customerDetails.getAddress()
        );

        customer.setCity(
                customerDetails.getCity()
        );

        customer.setState(
                customerDetails.getState()
        );

        customer.setZipCode(
                customerDetails.getZipCode()
        );

        return customerRepository.save(customer);
    }

    // =====================================================
    // DELETE CUSTOMER
    // =====================================================

    public void deleteCustomer(Long id) {

        Customer customer =
                getCustomerById(id);

        customerRepository.delete(customer);
    }
}