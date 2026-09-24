package com.fsm.entity;

import com.fasterxml.jackson.annotation.JsonProperty;\nimport jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
    }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "username",
        nullable = false,
        unique = true
    )
    private String username;

    @Column(
        name = "full_name",
        nullable = false
    )
    private String fullName;

    @Column(
        nullable = false,
        unique = true
    )
    private String email;

    @Column(
        nullable = false
    )
    private String phone;

    @Column(
        nullable = false
    )
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)\n    private String password;

    /*
     * Role is stored as text in the database so that
     * the existing database remains compatible.
     *
     * Allowed roles are:
     * DISPATCHER
     * TECHNICIAN
     * MANAGER
     * CUSTOMER
     */
    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false
    )
    private Role role;

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;


    // =========================================
    // CONSTRUCTOR
    // =========================================

    public User() {
    }


    // =========================================
    // CREATED DATE
    // =========================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

    }


    // =========================================
    // GETTERS & SETTERS
    // =========================================

    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getUsername() {
        return username;
    }


    public void setUsername(String username) {
        this.username = username;
    }


    public String getFullName() {
        return fullName;
    }


    public void setFullName(String fullName) {
        this.fullName = fullName;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(String email) {
        this.email = email;
    }


    public String getPhone() {
        return phone;
    }


    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getPassword() {
        return password;
    }


    public void setPassword(String password) {
        this.password = password;
    }


    public Role getRole() {
        return role;
    }


    public void setRole(Role role) {
        this.role = role;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}