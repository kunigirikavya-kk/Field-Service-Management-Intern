package com.fsm.e2e;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fsm.entity.Customer;
import com.fsm.entity.InventoryPart;
import com.fsm.entity.Role;
import com.fsm.entity.Site;
import com.fsm.entity.Technician;
import com.fsm.entity.User;
import com.fsm.entity.WorkOrder;
import com.fsm.repository.CustomerRepository;
import com.fsm.repository.InventoryRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
    @Autowired InventoryRepository inventoryRepository;

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

    @Test
    void customerDispatcherTechnicianManagerExecutionFlow() throws Exception {
        User customerUser = userRepository.findByEmail("customer@keystone.local").orElseThrow();
        Customer customer = customerRepository.findByUserId(customerUser.getId()).orElseThrow();
        Customer secondCustomer = customerRepository.findByUserId(
                userRepository.findByEmail("customer2@keystone.local").orElseThrow().getId()
        ).orElseThrow();
        Technician technician = technicianRepository.findByUserId(
                userRepository.findByEmail("technician@keystone.local").orElseThrow().getId()
        ).orElseThrow();
        Site site = siteRepository.findByCustomerId(customer.getId()).stream().findFirst().orElseThrow();

        String customerToken = login("customer@keystone.local");
        String secondCustomerToken = login("customer2@keystone.local");
        String dispatcherToken = login("dispatcher@keystone.local");
        String technicianToken = login("technician@keystone.local");
        String managerToken = login("manager@keystone.local");

        String serviceRequestBody = objectMapper.writeValueAsString(Map.of(
                "customerId", secondCustomer.getId(),
                "serviceType", "AC Maintenance",
                "priority", "HIGH",
                "title", "Customer-owned E2E request",
                "serviceLocation", "Test Site",
                "description", "Customer ownership and request creation test"
        ));

        String serviceRequestResponse = mockMvc.perform(post("/api/service-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(serviceRequestBody)
                        .header("Authorization", bearer(customerToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value(customer.getId()))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andReturn().getResponse().getContentAsString();

        long serviceRequestId = objectMapper.readTree(serviceRequestResponse).get("id").asLong();

        mockMvc.perform(get("/api/service-requests/{id}", serviceRequestId)
                        .header("Authorization", bearer(secondCustomerToken)))
                .andExpect(status().isForbidden());

        String workOrderBody = objectMapper.writeValueAsString(Map.of(
                "serviceRequestId", serviceRequestId,
                "customerId", customer.getId(),
                "siteId", site.getId(),
                "title", "E2E created work order",
                "priority", "HIGH",
                "serviceType", "AC Maintenance",
                "description", "Dispatcher creation flow"
        ));

        String workOrderResponse = mockMvc.perform(post("/api/work-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(workOrderBody)
                        .header("Authorization", bearer(dispatcherToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andReturn().getResponse().getContentAsString();

        long workOrderId = objectMapper.readTree(workOrderResponse).get("id").asLong();

        mockMvc.perform(post("/api/work-orders/{id}/assign", workOrderId)
                        .param("technicianId", technician.getId().toString())
                        .header("Authorization", bearer(dispatcherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"));

        String inventoryResponse = mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "partNumber", "E2E-" + System.nanoTime(),
                                "partName", "E2E Filter",
                                "category", "HVAC",
                                "quantity", 2,
                                "minimumStock", 1,
                                "unitPrice", 50.00,
                                "supplier", "KEYSTONE Test Supplier"
                        )))
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        long inventoryPartId = objectMapper.readTree(inventoryResponse).get("id").asLong();

        mockMvc.perform(post("/api/part-usage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "workOrderId", workOrderId,
                                "technicianId", technician.getId(),
                                "inventoryPartId", inventoryPartId,
                                "quantityUsed", 1
                        )))
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrderId)
                        .param("status", "IN_PROGRESS")
                        .header("Authorization", bearer(technicianToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/part-usage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "workOrderId", workOrderId,
                                "technicianId", technician.getId(),
                                "inventoryPartId", inventoryPartId,
                                "quantityUsed", 1
                        )))
                        .header("Authorization", bearer(technicianToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantityUsed").value(1));

        mockMvc.perform(get("/api/inventory/{id}", inventoryPartId)
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(1));

        mockMvc.perform(post("/api/time-logs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "workOrderId", workOrderId,
                                "technicianId", technician.getId(),
                                "minutes", 45,
                                "note", "E2E field work"
                        )))
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/time-logs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "workOrderId", workOrderId,
                                "technicianId", technician.getId(),
                                "minutes", 45,
                                "note", "E2E field work"
                        )))
                        .header("Authorization", bearer(technicianToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.minutes").value(45));

        WorkOrder saved = workOrderRepository.findById(workOrderId).orElseThrow();
        if (!Integer.valueOf(45).equals(saved.getLabourMinutes())) {
            throw new AssertionError("Expected 45 labour minutes but found " + saved.getLabourMinutes());
        }
        if (!BigDecimal.valueOf(50).equals(saved.getPartsCost())) {
            throw new AssertionError("Expected parts cost 50.00 but found " + saved.getPartsCost());
        }

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrderId)
                        .param("status", "COMPLETED")
                        .header("Authorization", bearer(technicianToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/work-orders/{id}/status", workOrderId)
                        .param("status", "CLOSED")
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));

        mockMvc.perform(delete("/api/part-usage/{id}", objectMapper.readTree(
                        mockMvc.perform(get("/api/part-usage/work-order/{id}", workOrderId)
                                .header("Authorization", bearer(technicianToken)))
                                .andExpect(status().isOk())
                                .andReturn().getResponse().getContentAsString()
                ).get(0).get("id").asLong())
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isNoContent());

        InventoryPart restored = inventoryRepository.findById(inventoryPartId).orElseThrow();
        if (!Integer.valueOf(2).equals(restored.getQuantity())) {
            throw new AssertionError("Expected stock restoration to 2 but found " + restored.getQuantity());
        }

        mockMvc.perform(get("/api/time-logs/work-order/{id}", workOrderId)
                        .header("Authorization", bearer(customerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
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
