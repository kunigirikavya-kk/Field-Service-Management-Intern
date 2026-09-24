package com.fsm.security;

import com.fsm.entity.Customer;
import com.fsm.entity.User;
import com.fsm.entity.Technician;
import com.fsm.repository.CustomerRepository;
import com.fsm.repository.UserRepository;
import com.fsm.repository.TechnicianRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {

    private final UserRepository userRepository;
    private final TechnicianRepository technicianRepository;
    private final CustomerRepository customerRepository;

    public AuthorizationService(
            UserRepository userRepository,
            TechnicianRepository technicianRepository,
            CustomerRepository customerRepository
    ) {
        this.userRepository = userRepository;
        this.technicianRepository = technicianRepository;
        this.customerRepository = customerRepository;
    }

    // =====================================================
    // CURRENT AUTHENTICATED USER
    // =====================================================

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                "anonymousUser".equals(
                        authentication.getPrincipal()
                )
        ) {
            throw new RuntimeException(
                    "Authentication required"
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }

    // =====================================================
    // CURRENT USER ID
    // =====================================================

    public Long getCurrentUserId() {

        return getCurrentUser().getId();
    }

    // =====================================================
    // CURRENT TECHNICIAN ID
    // =====================================================

    public Long getCurrentTechnicianId() {

        User currentUser =
                getCurrentUser();

        if (
                currentUser.getRole() == null ||
                !currentUser.getRole()
                        .name()
                        .equalsIgnoreCase("TECHNICIAN")
        ) {

            throw new RuntimeException(
                    "Current user is not a technician"
            );
        }

        Technician technician =
                technicianRepository
                        .findByUserId(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician profile not found for user id: "
                                                + currentUser.getId()
                                )
                        );

        return technician.getId();
    }

    // =====================================================
    // CURRENT CUSTOMER ID
    // =====================================================

    public Long getCurrentCustomerId() {

        User currentUser =
                getCurrentUser();

        if (
                currentUser.getRole() == null ||
                !currentUser.getRole()
                        .name()
                        .equalsIgnoreCase("CUSTOMER")
        ) {

            throw new RuntimeException(
                    "Current user is not a customer"
            );
        }

        Customer customer =
                customerRepository
                        .findByUserId(
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer profile not found for user id: "
                                                + currentUser.getId()
                                )
                        );

        return customer.getId();
    }

    // =====================================================
    // ROLE CHECK
    // =====================================================

    public boolean hasRole(String role) {

        User user =
                getCurrentUser();

        return user.getRole() != null &&
                user.getRole()
                        .name()
                        .equalsIgnoreCase(role);
    }

    // =====================================================
    // TECHNICIAN OWNERSHIP
    // =====================================================

    public boolean isCurrentTechnicianByUserId(Long userId) {
        if (!hasRole("TECHNICIAN")) return false;
        return getCurrentUserId().equals(userId);
    }

    public boolean isCurrentTechnician(
            Long technicianId
    ) {

        if (!hasRole("TECHNICIAN")) {
            return false;
        }

        return getCurrentTechnicianId()
                .equals(technicianId);
    }

    // =====================================================
    // CUSTOMER OWNERSHIP
    // =====================================================

    public boolean isCurrentCustomer(
            Long customerId
    ) {

        if (!hasRole("CUSTOMER")) {
            return false;
        }

        return getCurrentCustomerId()
                .equals(customerId);
    }

    // =====================================================
    // MANAGER
    // =====================================================

    public boolean isManager() {

        return hasRole("MANAGER");
    }

    // =====================================================
    // DISPATCHER
    // =====================================================

    public boolean isDispatcher() {

        return hasRole("DISPATCHER");
    }
}