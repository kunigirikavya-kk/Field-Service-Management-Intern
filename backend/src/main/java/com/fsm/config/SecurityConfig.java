package com.fsm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter,
            WebConfig webConfig
    ) throws Exception {

        http
            .cors(cors -> cors.configurationSource(
                    webConfig.corsConfigurationSource()
            ))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
            ))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, ex) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(
                        "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}"
                    );
                })
                .accessDeniedHandler((request, response, ex) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(
                        "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"You don't have permission to access this resource\"}"
                    );
                })
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",
                    "/api/users/login",
                    "/api/users/register",
                    "/api/health",
                    "/error"
                ).permitAll()

                .requestMatchers(HttpMethod.GET, "/api/customers/me")
                    .hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/customers", "/api/customers/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/customers", "/api/customers/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/customers", "/api/customers/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/customers", "/api/customers/**")
                    .hasRole("MANAGER")

                .requestMatchers(HttpMethod.GET, "/api/sites")
                    .hasAnyRole("DISPATCHER", "MANAGER", "TECHNICIAN")
                .requestMatchers(HttpMethod.GET, "/api/sites/customer/*", "/api/sites/*")
                    .hasAnyRole("CUSTOMER", "DISPATCHER", "MANAGER", "TECHNICIAN")
                .requestMatchers(HttpMethod.POST, "/api/sites", "/api/sites/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/sites", "/api/sites/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/sites", "/api/sites/**")
                    .hasRole("MANAGER")

                .requestMatchers(HttpMethod.GET, "/api/service-requests/*")
                    .hasAnyRole("CUSTOMER", "DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/api/service-requests")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                // Service-request role authorization is also enforced in ServiceRequestService
                // using the authenticated user's database role and ownership checks.
                .requestMatchers(HttpMethod.POST, "/api/service-requests", "/api/service-requests/**")
                    .authenticated()

                .requestMatchers(HttpMethod.GET, "/api/work-orders", "/api/work-orders/**")
                    .hasAnyRole("CUSTOMER", "TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/work-orders")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/work-orders/*/assign")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/work-orders/*/status")
                    .hasAnyRole("TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/work-orders/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/work-orders", "/api/work-orders/**")
                    .hasAnyRole("TECHNICIAN", "DISPATCHER", "MANAGER")

                .requestMatchers(HttpMethod.GET, "/api/technicians", "/api/technicians/**")
                    .hasAnyRole("TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/technicians", "/api/technicians/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/technicians", "/api/technicians/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/technicians", "/api/technicians/**")
                    .hasRole("MANAGER")

                .requestMatchers(HttpMethod.GET, "/api/schedules", "/api/schedules/**")
                    .hasAnyRole("TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/schedules", "/api/schedules/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/schedules", "/api/schedules/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/schedules", "/api/schedules/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")

                .requestMatchers(HttpMethod.GET, "/api/inventory", "/api/inventory/**")
                    .hasAnyRole("TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/inventory", "/api/inventory/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/inventory", "/api/inventory/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/inventory", "/api/inventory/**")
                    .hasRole("MANAGER")

                .requestMatchers(HttpMethod.GET, "/api/invoices", "/api/invoices/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/invoices", "/api/invoices/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/invoices", "/api/invoices/**")
                    .hasAnyRole("DISPATCHER", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/invoices", "/api/invoices/**")
                    .hasRole("MANAGER")

                .requestMatchers("/api/job-executions/**")
                    .hasAnyRole("TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers("/api/job-photos/**")
                    .hasAnyRole("TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers("/api/part-usage/**")
                    .hasAnyRole("TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers("/api/notifications/**")
                    .hasAnyRole("CUSTOMER", "TECHNICIAN", "DISPATCHER", "MANAGER")
                .requestMatchers("/api/reports/**")
                    .hasRole("MANAGER")

                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt ->
                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
            ));

        return http.build();
    }
}
