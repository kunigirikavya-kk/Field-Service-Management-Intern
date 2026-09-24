# Project KEYSTONE — Overall Status

Updated: 2026-09-24

## Current state

The repository is in a hardened integration-testing phase. The main backend workflow, role security, work-order lifecycle, PostgreSQL/Flyway setup, Docker stack, reporting/SLA/parts/time features, and frontend UI work are committed to `main`.

### Implemented

| Area | Status | Notes |
|---|---|---|
| Authentication / JWT | Implemented | JWT resource-server validation, BCrypt passwords, role claims |
| Roles | Implemented | Dispatcher, Technician, Manager, Customer, plus ADMIN support |
| Server-side RBAC | Implemented | API authorization is enforced independently of React navigation |
| Customer isolation | Implemented | Customer work-order access is ownership checked server-side |
| Work-order lifecycle | Implemented | NEW -> ASSIGNED -> IN_PROGRESS -> ON_HOLD -> IN_PROGRESS -> COMPLETED -> CLOSED |
| Status audit | Implemented | Status history is recorded and history access is ownership checked |
| Assignment | Implemented | Dispatcher/Manager/Admin assignment before field execution |
| Technician execution | Implemented | Start, hold, resume, complete |
| Parts / inventory | Implemented | Transactional deduction with row locking and no-negative-stock guard |
| Time logging | Implemented | Technician time entries roll into work-order labour minutes |
| Cost rollups | Implemented | Parts and labour-related work-order totals are maintained |
| SLA | Implemented | Priority-based due dates, breach detection, manager notifications |
| Reports | Implemented | Manager/Admin reporting endpoints |
| DTO boundary | Improved | Work-order API now uses response DTOs; other legacy controllers still need a broader DTO pass |
| Pagination | Implemented for work orders | Role-scoped endpoint supports page, size, sort and status filtering |
| PostgreSQL | Implemented | Docker Compose and application defaults use PostgreSQL |
| Flyway | Implemented | Schema is versioned under `backend/src/main/resources/db/migration` |
| Swagger / OpenAPI | Implemented | OpenAPI JSON and Swagger UI are exposed |
| Docker Compose | Implemented | PostgreSQL + backend + frontend stack |
| Frontend UI | Implemented | Dashboard, customers, technicians, execution and role-aware navigation refinements |
| Frontend build/lint | Configured | GitHub Actions runs production build and lint |
| PostgreSQL-backed E2E | Configured | Testcontainers integration suite covers role lifecycle and isolation |
| Docker stack smoke test | Configured | GitHub Actions checks API health, OpenAPI and frontend reachability |

## Automated E2E coverage

The integration suite exercises:

1. Login for Dispatcher, Technician, Manager and Customer.
2. Dispatcher assignment.
3. Technician lifecycle: start -> hold -> resume -> complete.
4. Manager close-out.
5. Customer can read its own work order.
6. Customer cannot read another customer's work order.
7. Customer cannot read another customer's work-order history.
8. Dispatcher cannot force a field-execution status.
9. Work-order history is created for lifecycle transitions.
10. Paginated work-order endpoint with status filtering.
11. Manager reporting endpoint.
12. Real PostgreSQL via Testcontainers + Flyway.

Run locally with Docker:

```bash
cd backend
mvn -B -P e2e verify
```

## Remaining hardening items

These are not hidden:

- The frontend is still JavaScript/JSX rather than a full TypeScript migration.
- DTO conversion is not yet universal across every legacy controller.
- Pagination/filtering is implemented for work orders, but not yet standardized across every list endpoint.
- Cloudinary photo upload still needs verification with real deployment credentials.
- No production deployment URL has been verified from this repository.
- GitHub Actions has been configured for the new E2E suite; the final post-change run must be observed before calling the repository fully green.

## Production gate

Do not treat the project as production-verified until:

- backend unit tests pass,
- PostgreSQL-backed E2E tests pass,
- Docker Compose smoke checks pass,
- frontend lint/build pass,
- Cloudinary upload is tested in the target environment,
- production secrets/CORS are configured,
- and the deployed URL is smoke-tested.

