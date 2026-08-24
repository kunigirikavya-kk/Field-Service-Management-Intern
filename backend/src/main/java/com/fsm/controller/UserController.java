package com.fsm.controller;

import com.fsm.dto.LoginRequest;
import com.fsm.dto.LoginResponse;
import com.fsm.dto.RegisterRequest;
import com.fsm.entity.User;
import com.fsm.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5174")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =====================================================
    // REGISTER
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        try {

            User user = userService.register(request);

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Registration successful");
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhone());
            response.put("role", user.getRole());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException e) {

            Map<String, String> error = new HashMap<>();

            error.put("message", e.getMessage());

            return ResponseEntity
                    .badRequest()
                    .body(error);
        }
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            LoginResponse response =
                    userService.login(request);

            Map<String, Object> result = new HashMap<>();

            result.put("message", "Login successful");
            result.put("token", response.getToken());
            result.put("id", response.getId());
            result.put("username", response.getUsername());
            result.put("fullName", response.getFullName());
            result.put("email", response.getEmail());
            result.put("phone", response.getPhone());
            result.put("role", response.getRole());

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {

            Map<String, String> error = new HashMap<>();

            error.put("message", e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(error);
        }
    }
}