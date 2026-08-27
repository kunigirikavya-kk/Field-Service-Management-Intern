package com.fsm.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
public class SecurityConfig {

    private final JwtAuthenticationConverter jwtAuthenticationConverter;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public SecurityConfig(
            JwtAuthenticationConverter jwtAuthenticationConverter
    ) {

        this.jwtAuthenticationConverter =
                jwtAuthenticationConverter;
    }


    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =================================================
                // CSRF
                // =================================================

                .csrf(csrf -> csrf.disable())


                // =================================================
                // CORS
                // =================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )


                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth


                        // =================================================
                        // BROWSER PREFLIGHT
                        // =================================================

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()


                        // =================================================
                        // PUBLIC REGISTER
                        // =================================================

                        .requestMatchers(
                                "/api/users/register"
                        ).permitAll()


                        // =================================================
                        // PUBLIC LOGIN
                        // =================================================

                        .requestMatchers(
                                "/api/users/login"
                        ).permitAll()


                        // =================================================
                        // SERVICE REQUESTS
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/service-requests"
                        ).hasRole("CUSTOMER")


                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/service-requests",
                                "/api/service-requests/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // =================================================
                        // WORK ORDERS
                        // =================================================

                        /*
                         * IMPORTANT:
                         *
                         * Schedule.jsx currently calls:
                         *
                         * GET /api/work-orders
                         *
                         * Your logged-in user is TECHNICIAN.
                         *
                         * Therefore TECHNICIAN must be allowed to
                         * read the work-order list.
                         *
                         * This fixes the current 403.
                         */

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders",
                                "/api/work-orders/status/**"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // TECHNICIAN WORK ORDERS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders/technician/**"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // CUSTOMER WORK ORDERS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders/customer/**"
                        ).hasAnyRole(
                                "CUSTOMER",
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // INDIVIDUAL WORK ORDER
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders/*"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // CREATE WORK ORDER
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/work-orders"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // UPDATE WORK ORDER
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/work-orders/*"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // ASSIGN TECHNICIAN
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/work-orders/*/assign"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // UPDATE WORK ORDER STATUS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/work-orders/*/status"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // =================================================
                        // SCHEDULES
                        // =================================================

                        // -------------------------------------------------
                        // VIEW SCHEDULES
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/schedules",
                                "/api/schedules/**"
                        ).authenticated()


                        // -------------------------------------------------
                        // CREATE SCHEDULE
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/schedules/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // UPDATE SCHEDULE
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/schedules/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // -------------------------------------------------
                        // DELETE SCHEDULE
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/schedules/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )


                        // =================================================
                        // JOB EXECUTIONS
                        // =================================================

                        .requestMatchers(
                                "/api/job-executions/**"
                        ).authenticated()


                        // =================================================
                        // INVENTORY
                        // =================================================

                        .requestMatchers(
                                "/api/inventory/**"
                        ).authenticated()


                        // =================================================
                        // INVOICES
                        // =================================================

                        .requestMatchers(
                                "/api/invoices/**"
                        ).authenticated()


                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest().authenticated()
                )


                // =================================================
                // JWT RESOURCE SERVER
                // =================================================

                .oauth2ResourceServer(
                        oauth2 ->
                                oauth2.jwt(jwt ->
                                        jwt.jwtAuthenticationConverter(
                                                jwtAuthenticationConverter
                                        )
                                )
                )


                // =================================================
                // STATELESS SESSION
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                );


        return http.build();
    }


    // =====================================================
    // CORS
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5174"
                )
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(false);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }
}