# KEYSTONE QA Baseline

Database: PostgreSQL 17
Migration tool: Flyway
Backend: Spring Boot 3 / Java 21
Frontend: React / TypeScript / Vite

The integration suite `RoleEndToEndIT` uses a real PostgreSQL Testcontainers instance and covers:
- Dispatcher assignment and work-order creation
- Technician lifecycle execution
- Manager closure, inventory administration and reports
- Customer service-request creation and customer isolation
- Cross-customer work-order/history isolation
- Technician-only part usage and time logging
- Inventory deduction and restoration
- Work-order labour/parts cost updates

CI must pass before deployment.
