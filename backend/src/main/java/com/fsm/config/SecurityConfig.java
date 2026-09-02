
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

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            // =================================================
            // CORS
            // =================================================

            .cors(cors ->
                    cors.configurationSource(
                            corsConfigurationSource()
                    )
            )

            // =================================================
            // CSRF
            // =================================================

            .csrf(csrf ->
                    csrf.disable()
            )

            // =================================================
            // SESSION
            // =================================================

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // =================================================
            // EXCEPTION HANDLING
            // =================================================

            .exceptionHandling(exception ->

                    exception
                            .authenticationEntryPoint(
                                    (request, response, authException) -> {

                                        response.setStatus(
                                                HttpServletResponse.SC_UNAUTHORIZED
                                        );

                                        response.setContentType(
                                                MediaType.APPLICATION_JSON_VALUE
                                        );

                                        response.getWriter().write(
                                                """
                                                {
                                                  "status": 401,
                                                  "error": "Unauthorized",
                                                  "message": "Authentication required"
                                                }
                                                """
                                        );
                                    }
                            )

                            .accessDeniedHandler(
                                    (request, response, accessDeniedException) -> {

                                        response.setStatus(
                                                HttpServletResponse.SC_FORBIDDEN
                                        );

                                        response.setContentType(
                                                MediaType.APPLICATION_JSON_VALUE
                                        );

                                        response.getWriter().write(
                                                """
                                                {
                                                  "status": 403,
                                                  "error": "Forbidden",
                                                  "message": "You don't have permission to access this resource"
                                                }
                                                """
                                        );
                                    }
                            )
            )

            // =================================================
            // AUTHORIZATION
            // =================================================

            .authorizeHttpRequests(auth -> auth

                    // =================================================
                    // PUBLIC ENDPOINTS
                    // =================================================

                    .requestMatchers(
                            "/api/auth/**"
                    ).permitAll()

                    .requestMatchers(
                            "/api/health"
                    ).permitAll()


                    // =================================================
                    // CUSTOMERS
                    // =================================================

                    /*
                     * IMPORTANT:
                     *
                     * CUSTOMER users must NOT be able to access
                     * the general customer-management endpoint.
                     *
                     * Only DISPATCHER and MANAGER can:
                     *
                     * GET /api/customers
                     * GET /api/customers/{id}
                     */

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/customers",
                            "/api/customers/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )


                    /*
                     * Create customers.
                     */

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/customers",
                            "/api/customers/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )


                    /*
                     * Update customers.
                     */

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/customers",
                            "/api/customers/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )


                    /*
                     * Delete customers.
                     */

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/customers",
                            "/api/customers/**"
                    ).hasRole(
                            "MANAGER"
                    )


                    // =================================================
                    // SITES
                    // =================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/sites",
                            "/api/sites/**"
                    ).hasAnyRole(
                            "CUSTOMER",
                            "DISPATCHER",
                            "MANAGER",
                            "TECHNICIAN"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/sites",
                            "/api/sites/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/sites",
                            "/api/sites/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/sites",
                            "/api/sites/**"
                    ).hasRole(
                            "MANAGER"
                    )


                    // =================================================
                    // SERVICE REQUESTS
                    // =================================================

                    /*
                     * Dispatcher and Manager can see all requests.
                     */

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/service-requests",
                            "/api/service-requests/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )


                    /*
                     * Customer can create a service request.
                     *
                     * IMPORTANT:
                     * Your ServiceRequestService should eventually
                     * validate that the customerId belongs to the
                     * authenticated CUSTOMER.
                     */

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/service-requests",
                            "/api/service-requests/**"
                    ).hasAnyRole(
                            "CUSTOMER",
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =================================================
                    // WORK ORDERS
                    // =================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/work-orders",
                            "/api/work-orders/**"
                    ).hasAnyRole(
                            "CUSTOMER",
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/work-orders",
                            "/api/work-orders/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/work-orders",
                            "/api/work-orders/**"
                    ).hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =================================================
                    // TECHNICIANS
                    // =================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/technicians",
                            "/api/technicians/**"
                    ).hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/technicians",
                            "/api/technicians/**"
                    ).hasAnyRole(
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/technicians",
                            "/api/technicians/**"
                    ).hasRole(
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/technicians",
                            "/api/technicians/**"
                    ).hasRole(
                            "MANAGER"
                    )


                    // =================================================
                    // SCHEDULES
                    // =================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/schedules",
                            "/api/schedules/**"
                    ).hasAnyRole(
                            "TECHNICIAN",
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
                            "MANAGER",
                            "TECHNICIAN"
                    )


                    // =================================================
                    // INVENTORY
                    // =================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/inventory",
                            "/api/inventory/**"
                    ).hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/inventory",
                            "/api/inventory/**"
                    ).hasRole(
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/inventory",
                            "/api/inventory/**"
                    ).hasRole(
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/inventory",
                            "/api/inventory/**"
                    ).hasRole(
                            "MANAGER"
                    )


                    // =================================================
                    // INVOICES / BILLING
                    // =================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/invoices",
                            "/api/invoices/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/invoices",
                            "/api/invoices/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/invoices",
                            "/api/invoices/**"
                    ).hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =================================================
                    // JOB EXECUTION
                    // =================================================

                    .requestMatchers(
                            "/api/job-execution/**"
                    ).hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =================================================
                    // NOTIFICATIONS
                    // =================================================

                    .requestMatchers(
                            "/api/notifications/**"
                    ).hasAnyRole(
                            "CUSTOMER",
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =================================================
                    // REPORTS
                    // =================================================

                    .requestMatchers(
                            "/api/reports/**"
                    ).hasRole(
                            "MANAGER"
                    )


                    // =================================================
                    // EVERYTHING ELSE
                    // =================================================

                    .anyRequest().authenticated()
            )

            // =================================================
            // JWT RESOURCE SERVER
            // =================================================

            .oauth2ResourceServer(oauth2 ->
                    oauth2
                            .jwt(jwt ->
                                    jwt.jwtAuthenticationConverter(
                                            jwtAuthenticationConverter()
                                    )
                            )
            );

        return http.build();
    }


    // =====================================================
    // JWT AUTHENTICATION CONVERTER
    // =====================================================

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        /*
         * Our JWT contains:
         *
         * "role": "DISPATCHER"
         *
         * Spring Security expects:
         *
         * ROLE_DISPATCHER
         *
         * Therefore we convert the "role" claim into a
         * Spring Security authority.
         */

        authoritiesConverter.setAuthoritiesClaimName(
                "role"
        );

        authoritiesConverter.setAuthorityPrefix(
                "ROLE_"
        );


        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                authoritiesConverter
        );

        return converter;
    }


    // =====================================================
    // CORS CONFIGURATION
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
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        configuration.setAllowCredentials(
                true
        );


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}

