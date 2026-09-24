package com.fsm.e2e;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fsm.entity.Customer;
import com.fsm.entity.Role;
import com.fsm.entity.Site;
import com.fsm.entity.Technician;
import com.fsm.entity.User;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.CustomerRepository;
import com.fsm.repository.SiteRepository;
import com.fsm.repository.TechnicianRepository;
import com.fsm.repository.UserRepository;
import com.fsm.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class RoleEndToEndIT {

    @Container
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer("postgres:17-alpine")
                    .withDatabaseName("field_service_management_e2e")
                    .withUsername("postgres")
                    .withPassword("e2e-password");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("jwt.secret", () -> "e2e-test-secret-that-is-at-least-32-characters-long");
        registry.add("jwt.expiration-minutes", () -> "30");
        registry.add("app.cors.allowed-origins", () -> "http://localhost:5174");
        registry.add("SLA_CHECK_DELAY_MS", () -> "3600000");
    }

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired TechnicianRepository technicianRepository;
    @Autowired SiteRepository siteRepository;
    @Autowired WorkOrderRepository workOrderRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void prepareAccounts() {
        String password = passwordEncoder.encode("E2EPassword123!");

        for (String email : new String[]{
                "dispatcher@keystone.local",
                "manager@keystone.local",
                "technician@keystone.local",
                "customer@keystone.local"
        }) {
            User user = userRepository.findByEmail(email).orElseThrow();
            user.setPassword(password);
            userRepository.save(user);
        }

        if (userRepository.findByEmail("customer2@keystone.local").isEmpty()) {
            User customerUser = new User();
            customerUser.setUsername("customer2@keystone.local");
            customerUser.setFullName("KEYSTONE Customer Two");
            customerUser.setEmail("customer2@keystone.local");
            customerUser.setPhone("9000000010");
            customerUser.setPassword(password);
            customerUser.setRole(Role.CUSTOMER);
            customerUser = userRepository.save(customerUser);

            Customer customer = new Customer();
            customer.setUserId(customerUser.getId());
            customer.setCompanyName("KEYSTONE Second Customer");
            customer.setContactPerson(customerUser.getFullName());
            customer.setEmail(customerUser.getEmail());
            customer.setPhone(customerUser.getPhone());
            customerRepository.save(customer);
        }
    }

    @Test
    void fullRoleLifecycleAndIsolation() throws Exception {
        User customerUser = userRepository.findByEmail("customer@keystone.local").orElseThrow();
        Customer customer = customerRepository.findByUserId(customerUser.getId()).orElseThrow();
        Technician technician = technicianRepository.findByUserId(
                userRepository.findByEmail("technician@keystone.local").orElseThrow().getId()
        ).orElseThrow();
        Site site = siteRepository.findByCustomerId(customer.getId()).stream().findFirst().orElseThrow();

        WorkOrder workOrder = new WorkOrder();
        workOrder.setCustomerId(customer.getId());
        workOrder.setSiteId(site.getId());
        workOrder.setOrderNumber("WO-E2E-001");
        workOrder.setTitle("E2E HVAC Maintenance");
        workOrder.setDescription("Role lifecycle verification");
        workOrder.setPriority(com.fsm.entity.Priority.HIGH);
        workOrder.setServiceType(WorkOrder.ServiceType.AC_MAINTENANCE);
        workOrder.setStatus(WorkOrder.Status.NEW);
        workOrder.setTotalCost(BigDecimal.ZERO);
        workOrder = workOrderRepository.saveAndFlush(workOrder);

        String dispatcherToken = login("dispatcher@keystone.local");
        String technicianToken = login("technician@keystone.local");
        String managerToken = login("manager@keystone.local");
        String customerToken = login("customer@keystone.local");
        String secondCustomerToken = login("customer2@keystone.local");

        mockMvc.perform(post("/api/work-orders/{id}/assign", workOrder.getId())
                        .param("technicianId", technician.getId().toString())
                        .header("Authorization", bearer(dispatcherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"));

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrder.getId())
                        .param("status", "IN_PROGRESS")
                        .header("Authorization", bearer(technicianToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrder.getId())
                        .param("status", "ON_HOLD")
                        .header("Authorization", bearer(technicianToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ON_HOLD"));

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrder.getId())
                        .param("status", "IN_PROGRESS")
                        .header("Authorization", bearer(technicianToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrder.getId())
                        .param("status", "COMPLETED")
                        .header("Authorization", bearer(technicianToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrder.getId())
                        .param("status", "CLOSED")
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));

        mockMvc.perform(get("/api/work-orders/{id}", workOrder.getId())
                        .header("Authorization", bearer(customerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(customer.getId()))
                .andExpect(jsonPath("$.totalCost").doesNotExist())
                .andExpect(jsonPath("$.slaDueAt").doesNotExist());

        mockMvc.perform(get("/api/work-orders/{id}", workOrder.getId())
                        .header("Authorization", bearer(secondCustomerToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/work-orders/{id}/history", workOrder.getId())
                        .header("Authorization", bearer(customerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)));

        mockMvc.perform(get("/api/work-orders/{id}/history", workOrder.getId())
                        .header("Authorization", bearer(secondCustomerToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrder.getId())
                        .param("status", "IN_PROGRESS")
                        .header("Authorization", bearer(dispatcherToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/work-orders/page")
                        .param("status", "CLOSED")
                        .param("page", "0")
                        .param("size", "1")
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));

        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk());
    }

    private String login(String email) throws Exception {
        String body = objectMapper.writeValueAsString(
                Map.of("email", email, "password", "E2EPassword123!")
        );

        String response = mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(nullValue())))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
