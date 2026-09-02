package com.fsm.service;

import com.fsm.entity.Customer;
import com.fsm.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
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