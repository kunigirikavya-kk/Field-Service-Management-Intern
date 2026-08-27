package com.fsm.service;

import com.fsm.dto.LoginRequest;
import com.fsm.dto.LoginResponse;
import com.fsm.dto.RegisterRequest;
import com.fsm.entity.Role;
import com.fsm.entity.User;
import com.fsm.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    private final JwtService jwtService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public UserService(
            UserRepository userRepository,
            JwtService jwtService
    ) {

        this.userRepository = userRepository;

        this.jwtService = jwtService;

        this.passwordEncoder =
                new BCryptPasswordEncoder();
    }


    // =====================================================
    // REGISTER
    // =====================================================

    public User register(RegisterRequest request) {

        // =================================================
        // FULL NAME
        // =================================================

        if (
                request.getFullName() == null ||
                request.getFullName().trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Full name is required"
            );
        }


        // =================================================
        // EMAIL
        // =================================================

        if (
                request.getEmail() == null ||
                request.getEmail().trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Email is required"
            );
        }


        // =================================================
        // PHONE
        // =================================================

        if (
                request.getPhone() == null ||
                request.getPhone().trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Phone number is required"
            );
        }


        // =================================================
        // PASSWORD
        // =================================================

        if (
                request.getPassword() == null ||
                request.getPassword().length() < 6
        ) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters"
            );
        }


        // =================================================
        // CLEAN EMAIL
        // =================================================

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();


        // =================================================
        // CHECK EXISTING EMAIL
        // =================================================

        if (
                userRepository.existsByEmail(email)
        ) {

            throw new RuntimeException(
                    "An account with this email already exists"
            );
        }


        // =================================================
        // USERNAME
        // =================================================
        //
        // The existing project uses email as username.
        //

        String username = email;


        // =================================================
        // CHECK EXISTING USERNAME
        // =================================================

        if (
                userRepository.existsByUsername(username)
        ) {

            throw new RuntimeException(
                    "An account with this username already exists"
            );
        }


        // =================================================
        // CREATE USER
        // =================================================

        User user = new User();


        user.setUsername(username);


        user.setFullName(
                request.getFullName().trim()
        );


        user.setEmail(email);


        user.setPhone(
                request.getPhone().trim()
        );


        // =================================================
        // HASH PASSWORD USING BCRYPT
        // =================================================

        String hashedPassword =
                passwordEncoder.encode(
                        request.getPassword()
                );


        user.setPassword(hashedPassword);


        // =================================================
        // ROLE
        // =================================================
        //
        // IMPORTANT SECURITY RULE:
        //
        // Public registration ALWAYS creates a CUSTOMER.
        //
        // We do NOT accept a role from the registration
        // request.
        //
        // A public user must never be able to register as:
        //
        // DISPATCHER
        // TECHNICIAN
        // MANAGER
        //
        // This protects the role system.
        //

        user.setRole(Role.CUSTOMER);


        // =================================================
        // SAVE USER
        // =================================================

        return userRepository.save(user);
    }


    // =====================================================
    // LOGIN
    // =====================================================

    public LoginResponse login(
            LoginRequest request
    ) {

        // =================================================
        // VALIDATE EMAIL
        // =================================================

        if (
                request.getEmail() == null ||
                request.getEmail().trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Email is required"
            );
        }


        // =================================================
        // VALIDATE PASSWORD
        // =================================================

        if (
                request.getPassword() == null ||
                request.getPassword().isEmpty()
        ) {

            throw new RuntimeException(
                    "Password is required"
            );
        }


        // =================================================
        // CLEAN EMAIL
        // =================================================

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();


        // =================================================
        // FIND USER
        // =================================================

        Optional<User> optionalUser =
                userRepository.findByEmail(email);


        if (optionalUser.isEmpty()) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }


        User user =
                optionalUser.get();


        // =================================================
        // VERIFY PASSWORD
        // =================================================

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );


        if (!passwordMatches) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }


        // =================================================
        // GENERATE JWT TOKEN
        // =================================================

        String token =
                jwtService.generateToken(
                        user.getUsername(),
                        user.getRole().name()
                );


        // =================================================
        // RETURN LOGIN RESPONSE
        // =================================================

        return new LoginResponse(

                token,

                user.getId(),

                user.getUsername(),

                user.getFullName(),

                user.getEmail(),

                user.getPhone(),

                user.getRole().name()
        );
    }
}