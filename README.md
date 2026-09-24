# Project KEYSTONE — Field Service Management Platform

Spring Boot 3 + Java 21 + React/Vite + PostgreSQL + Flyway.

## Implemented scope
- JWT authentication with BCrypt passwords and four business roles: Dispatcher, Technician, Manager, Customer.
- Server-side role and ownership enforcement; the React UI is not the security boundary.
- Customer/site management.
- Service requests with ownership protection.
- Work-order creation, editing while open, assignment/reassignment before execution, and unique human-readable order numbers.
- Governed lifecycle: NEW -> ASSIGNED -> IN_PROGRESS -> ON_HOLD -> IN_PROGRESS -> COMPLETED -> CLOSED, with cancellation from NEW/ASSIGNED.
- Append-only work-order status history.
- Technician field execution, photos, parts usage and time logging.
- Transactional stock deduction with pessimistic row locking; stock cannot go negative.
- Parts cost and labour-minute rollups on work orders.
- Configurable SLA due dates by priority, scheduled breach detection and manager notifications.
- Manager operational reporting: status counts, overdue work, SLA compliance, technician/site breakdown.
- Customer portal data is role-scoped and internal work-order fields are hidden from customer responses.
- OpenAPI/Swagger UI.
- PostgreSQL schema managed by Flyway; no Hibernate schema mutation in production.
- Docker Compose for the complete local stack.
- GitHub Actions backend unit tests, PostgreSQL-backed role lifecycle integration tests, Docker Compose smoke validation, and frontend lint/build validation.

## Local setup
1. Copy `.env.example` to `.env` and replace the local password/secret values.
2. Start the complete stack: `docker compose up --build`
3. Open:
- Frontend: http://localhost:5174
- API health: http://localhost:8080/api/health
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

Flyway runs automatically when the backend starts. The authoritative schema is under `backend/src/main/resources/db/migration`.

## Demo logins
The Flyway baseline seeds local/review accounts with the password `Password123!`:

| Role | Email |
|---|---|
| Dispatcher | dispatcher@keystone.local |
| Manager | manager@keystone.local |
| Technician | technician@keystone.local |
| Customer | customer@keystone.local |

These credentials are for local/review environments only. Change or remove seeded demo users before production.

## Validation
- Backend unit/compile tests: `cd backend && mvn -B test`
- Full PostgreSQL-backed role E2E tests (requires Docker): `cd backend && mvn -B -P e2e verify`
- Frontend production checks: `cd frontend/fsm-frontend && npm ci && npm run lint && npm run build`
- Complete local stack smoke test: `docker compose up --build`

The role E2E suite exercises login, Dispatcher assignment, Technician lifecycle, Manager close-out, customer data isolation, protected history access, and Manager reporting against a real PostgreSQL container. Cloudinary photo delivery remains environment-dependent and should be verified with real Cloudinary credentials before production use.

## Manual run
Backend: `cd backend` then run the Maven/Spring Boot application with the environment variables from `.env`.
Frontend: `cd frontend/fsm-frontend`, `npm ci`, then `npm run dev`.

## Environment variables
Backend: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `FLYWAY_ENABLED`, `JPA_DDL_AUTO`, `JWT_SECRET`, `JWT_EXPIRATION_MINUTES`, `CORS_ALLOWED_ORIGINS`, Cloudinary variables, and SLA hour variables.
Frontend: `VITE_API_BASE_URL`.
Never commit real secrets.

## API surface
- `POST /api/users/login`
- `POST /api/users/register`
- `GET/POST /api/customers`
- `GET/POST /api/sites/customer/{customerId}`
- `GET/POST /api/service-requests`
- `GET/POST /api/work-orders`\n- `GET /api/work-orders/page?page=0&size=20&sort=createdAt,desc&status=NEW`
- `GET/PUT /api/work-orders/{id}`
- `POST /api/work-orders/{id}/assign`
- `POST /api/work-orders/{id}/status`
- `GET /api/work-orders/{id}/history`
- `POST /api/part-usage`
- `POST /api/time-logs`
- `GET /api/notifications`
- `GET /api/reports/summary`
- `GET /swagger-ui.html`

Errors use a consistent JSON structure with timestamp, HTTP status, message and field errors.

## Role-to-role acceptance testing
1. Customer logs in, creates a request for their own account, and sees only their own work.
2. Dispatcher logs in, creates customer/site/work order, assigns or reassigns a technician, and sees open work.
3. Technician logs in, sees only assigned jobs, starts/holds/resumes/completes, logs parts/time and uploads photos.
4. Manager logs in, sees SLA/overdue/availability reporting and closes only COMPLETED jobs.
5. Direct API calls using another customer/technician ID are rejected server-side.
6. Illegal lifecycle jumps are rejected with HTTP 409.
7. Part usage is transactional and cannot drive stock below zero.
8. SLA breaches are recorded and notify managers.
9. Swagger exposes the controller surface.

## Clean checkout rule
A reviewer should be able to clone the repository, configure `.env`, run Docker Compose, and obtain the complete stack from PostgreSQL migrations without manually editing the database.