package com.fsm.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter
    ) throws Exception {

        http
            .cors(cors ->
                    cors.configurationSource(
                            corsConfigurationSource()
                    )
            )

            .csrf(csrf ->
                    csrf.disable()
            )

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

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

            .authorizeHttpRequests(auth -> auth

                    // =====================================================
                    // PUBLIC ENDPOINTS
                    // =====================================================

                    .requestMatchers(
                            "/api/auth/**",
                            "/api/users/login",
                            "/api/users/register"
                    )
                    .permitAll()

                    .requestMatchers(
                            "/api/health"
                    )
                    .permitAll()


                    // =====================================================
                    // CUSTOMERS
                    // =====================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/customers/me"
                    )
                    .hasRole("CUSTOMER")

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/customers",
                            "/api/customers/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/customers",
                            "/api/customers/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/customers",
                            "/api/customers/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/customers",
                            "/api/customers/**"
                    )
                    .hasRole("MANAGER")


                    // =====================================================
                    // SITES
                    // =====================================================

                    /*
                     * Get ALL sites.
                     *
                     * Customers must NOT access the complete site list.
                     * Technicians, Dispatchers and Managers may access it.
                     */
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/sites"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER",
                            "TECHNICIAN"
                    )

                    /*
                     * Get customer-specific sites.
                     *
                     * SiteService performs the ownership check for
                     * CUSTOMER requests.
                     */
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/sites/customer/*"
                    )
                    .hasAnyRole(
                            "CUSTOMER",
                            "DISPATCHER",
                            "MANAGER",
                            "TECHNICIAN"
                    )

                    /*
                     * Get a site by ID.
                     *
                     * SiteService performs customer ownership checks.
                     */
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/sites/*"
                    )
                    .hasAnyRole(
                            "CUSTOMER",
                            "DISPATCHER",
                            "MANAGER",
                            "TECHNICIAN"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/sites",
                            "/api/sites/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/sites",
                            "/api/sites/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/sites",
                            "/api/sites/**"
                    )
                    .hasRole("MANAGER")


                    // =====================================================
                    // SERVICE REQUESTS
                    // =====================================================

                    /*
                     * Customer can view an individual service request.
                     *
                     * ServiceRequestService performs the ownership
                     * check so a customer can only view their own
                     * request.
                     */
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/service-requests/*"
                    )
                    .hasAnyRole(
                            "CUSTOMER",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    /*
                     * Get all service requests.
                     *
                     * Customers and Technicians must NOT access
                     * the complete service-request list.
                     */
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/service-requests"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    /*
                     * Create service requests.
                     *
                     * Customers can create their own requests.
                     * ServiceRequestService verifies customer ownership.
                     */
                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/service-requests",
                            "/api/service-requests/**"
                    )
                    .hasAnyRole(
                            "CUSTOMER",
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =====================================================
                    // WORK ORDERS
                    // =====================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/work-orders",
                            "/api/work-orders/**"
                    )
                    .hasAnyRole(
                            "CUSTOMER",
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/work-orders"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/work-orders/*/assign"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/work-orders/*/status"
                    )
                    .hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/work-orders/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/work-orders",
                            "/api/work-orders/**"
                    )
                    .hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =====================================================
                    // TECHNICIANS
                    // =====================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/technicians",
                            "/api/technicians/**"
                    )
                    .hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/technicians",
                            "/api/technicians/**"
                    )
                    .hasRole("MANAGER")

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/technicians",
                            "/api/technicians/**"
                    )
                    .hasRole("MANAGER")

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/technicians",
                            "/api/technicians/**"
                    )
                    .hasRole("MANAGER")


                    // =====================================================
                    // SCHEDULES
                    // =====================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/schedules",
                            "/api/schedules/**"
                    )
                    .hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/schedules",
                            "/api/schedules/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/schedules",
                            "/api/schedules/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =====================================================
                    // INVENTORY
                    // =====================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/inventory",
                            "/api/inventory/**"
                    )
                    .hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/inventory",
                            "/api/inventory/**"
                    )
                    .hasRole("MANAGER")

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/inventory",
                            "/api/inventory/**"
                    )
                    .hasRole("MANAGER")

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/inventory",
                            "/api/inventory/**"
                    )
                    .hasRole("MANAGER")


                    // =====================================================
                    // INVOICES
                    // =====================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/invoices",
                            "/api/invoices/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/invoices",
                            "/api/invoices/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/invoices",
                            "/api/invoices/**"
                    )
                    .hasAnyRole(
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =====================================================
                    // JOB EXECUTION
                    // =====================================================

                    .requestMatchers(
                            "/api/job-executions/**"
                    )
                    .hasAnyRole(
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =====================================================
                    // NOTIFICATIONS
                    // =====================================================

                    .requestMatchers(
                            "/api/notifications/**"
                    )
                    .hasAnyRole(
                            "CUSTOMER",
                            "TECHNICIAN",
                            "DISPATCHER",
                            "MANAGER"
                    )


                    // =====================================================
                    // REPORTS
                    // =====================================================

                    .requestMatchers(
                            "/api/reports/**"
                    )
                    .hasRole("MANAGER")


                    // =====================================================
                    // EVERYTHING ELSE
                    // =====================================================

                    .anyRequest()
                    .authenticated()
            )

            .oauth2ResourceServer(oauth2 ->
                    oauth2.jwt(jwt ->
                            jwt.jwtAuthenticationConverter(
                                    jwtAuthenticationConverter
                            )
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

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}