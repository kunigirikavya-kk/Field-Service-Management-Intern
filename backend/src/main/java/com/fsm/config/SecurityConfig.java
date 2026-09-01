package com.fsm.config;

import java.io.IOException;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        // =================================================
        // JWT ROLE CONVERTER
        // =================================================

        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        /*
         * Your JWT contains:
         *
         * "role": "TECHNICIAN"
         *
         * We explicitly tell Spring Security to read
         * the custom "role" claim.
         *
         * Spring will then convert:
         *
         * TECHNICIAN
         *
         * into:
         *
         * ROLE_TECHNICIAN
         *
         * This allows:
         *
         * hasRole("TECHNICIAN")
         *
         * to work correctly.
         */

        grantedAuthoritiesConverter.setAuthoritiesClaimName("role");
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter =
                new JwtAuthenticationConverter();

        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
                grantedAuthoritiesConverter
        );

        // =================================================
        // HTTP SECURITY
        // =================================================

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

                        // -------------------------------------------------
                        // OPTIONS / PREFLIGHT
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // PUBLIC AUTHENTICATION
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login"
                        ).permitAll()

                        // =================================================
                        // USERS
                        // =================================================

                        .requestMatchers(
                                "/api/users/**"
                        ).hasRole("MANAGER")

                        // =================================================
                        // CUSTOMERS
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/customers",
                                "/api/customers/**"
                        ).hasAnyRole(
                                "CUSTOMER",
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/customers",
                                "/api/customers/**"
                        ).hasAnyRole(
                                "CUSTOMER",
                                "DISPATCHER",
                                "MANAGER"
                        )

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

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/work-orders"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/work-orders/*"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/work-orders/*/assign"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        // -------------------------------------------------
                        // TECHNICIAN WORK ORDERS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders/technician/**"
                        ).hasRole("TECHNICIAN")

                        // -------------------------------------------------
                        // CUSTOMER WORK ORDERS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders/customer/**"
                        ).hasRole("CUSTOMER")

                        // -------------------------------------------------
                        // WORK ORDERS BY STATUS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders/status/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        // -------------------------------------------------
                        // GET ALL WORK ORDERS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        // -------------------------------------------------
                        // GET WORK ORDER BY ID
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/work-orders/*"
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
                                "TECHNICIAN",
                                "DISPATCHER",
                                "MANAGER"
                        )

                        // =================================================
                        // SCHEDULES
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/schedules/technician/**"
                        ).hasRole("TECHNICIAN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/schedules/work-order/**"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/schedules/date/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/schedules/status/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/schedules",
                                "/api/schedules/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/schedules",
                                "/api/schedules/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/schedules",
                                "/api/schedules/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/schedules",
                                "/api/schedules/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        // =================================================
                        // JOB EXECUTIONS
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/job-executions/technician/**"
                        ).hasRole("TECHNICIAN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/job-executions/work-order/**"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/job-executions/schedule/**"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/job-executions/status/**"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/job-executions"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/job-executions/start"
                        ).hasRole("TECHNICIAN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/job-executions/*"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/job-executions/*/complete"
                        ).hasRole("TECHNICIAN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/job-executions/*/cancel"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "MANAGER"
                        )

                        // =================================================
                        // INVENTORY
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/inventory",
                                "/api/inventory/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "TECHNICIAN",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/inventory",
                                "/api/inventory/**"
                        ).hasRole("MANAGER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/inventory/*"
                        ).hasRole("MANAGER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/inventory/*/stock"
                        ).hasAnyRole(
                                "TECHNICIAN",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/inventory/*"
                        ).hasRole("MANAGER")

                        // =================================================
                        // INVOICES
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/invoices/**"
                        ).hasAnyRole(
                                "DISPATCHER",
                                "MANAGER"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/invoices/**"
                        ).hasRole("MANAGER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/invoices/**"
                        ).hasRole("MANAGER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/invoices/**"
                        ).hasRole("MANAGER")

                        // =================================================
                        // REPORTS
                        // =================================================

                        .requestMatchers(
                                "/api/reports/**"
                        ).hasRole("MANAGER")

                        // =================================================
                        // ANALYTICS
                        // =================================================

                        .requestMatchers(
                                "/api/analytics/**"
                        ).hasRole("MANAGER")

                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest().authenticated()
                )

                // =====================================================
                // JWT RESOURCE SERVER
                // =====================================================

                .oauth2ResourceServer(
                        oauth2 ->
                                oauth2.jwt(jwt ->
                                        jwt.jwtAuthenticationConverter(
                                                jwtAuthenticationConverter
                                        )
                                )
                                .authenticationEntryPoint(
                                        authenticationEntryPoint()
                                )
                )

                // =====================================================
                // ACCESS DENIED
                // =====================================================

                .exceptionHandling(exception ->
                        exception.accessDeniedHandler(
                                accessDeniedHandler()
                        )
                )

                // =====================================================
                // STATELESS
                // =====================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                );

        return http.build();
    }

    // =====================================================
    // 401 UNAUTHORIZED
    // =====================================================

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {

        return (request, response, authException) -> {

            response.setStatus(401);

            response.setContentType(
                    MediaType.APPLICATION_JSON_VALUE
            );

            response.getWriter().write("""
                    {
                      "status": 401,
                      "error": "Unauthorized",
                      "message": "Authentication required"
                    }
                    """);
        };
    }

    // =====================================================
    // 403 FORBIDDEN
    // =====================================================

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {

        return (request, response, accessDeniedException) -> {

            response.setStatus(403);

            response.setContentType(
                    MediaType.APPLICATION_JSON_VALUE
            );

            response.getWriter().write("""
                    {
                      "status": 403,
                      "error": "Forbidden",
                      "message": "You don't have permission to access this resource"
                    }
                    """);
        };
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