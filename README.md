# FieldSync — Field Service Management

Production-ready field service management application.

## Features
- JWT authentication and role-based access
- Customers and sites
- Service requests
- Work orders and technician assignment
- Scheduling and job execution
- Inventory and parts usage
- Billing and invoices
- Reports
- Cloudinary job-photo uploads
- Responsive React dashboard

## Stack
React 19 + Vite • Spring Boot 3.5 / Java 21 • Spring Security • JPA/Hibernate • MySQL 8 • Cloudinary

## Local development

### Docker
1. Copy `.env.example` to `.env`.
2. Set a unique `JWT_SECRET` of at least 32 characters.
3. Add Cloudinary credentials if photo uploads are needed.
4. Run:
```bash
docker compose up --build
```
Frontend: http://localhost:5174
API health: http://localhost:8080/api/health

### Manual
```bash
mysql -u root -p < database/database/fsm_database.sql
cd backend
./mvnw spring-boot:run
cd ../frontend/fsm-frontend
npm ci
npm run dev
```

## Environment variables
Backend: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MINUTES`, `CORS_ALLOWED_ORIGINS`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `JPA_DDL_AUTO`, `JPA_SHOW_SQL`.
Frontend: `VITE_API_BASE_URL`.
Never commit `.env` or production credentials.

## Deployment
### Database
Use a managed MySQL-compatible database. Run `database/database/fsm_database.sql` once for a new database. For an existing compatible schema, `JPA_DDL_AUTO=update` can apply Hibernate changes during initial deployment.

### Backend — Render or Railway
Root directory: `backend`
Build: `./mvnw -DskipTests package`
Start: `java -jar target/field-service-management-0.0.1-SNAPSHOT.jar`
Required environment: database variables, `JWT_SECRET` (32+ random characters), `JWT_EXPIRATION_MINUTES=120`, `CORS_ALLOWED_ORIGINS=https://<frontend-domain>`, `JPA_DDL_AUTO=update`, `JPA_SHOW_SQL=false`.
Health check: `/api/health`.

### Frontend — Vercel or Netlify
Root directory: `frontend/fsm-frontend`
Build: `npm run build`
Output: `dist`
Environment: `VITE_API_BASE_URL=https://<backend-domain>/api`
Configure SPA fallback so application routes serve `index.html`.

## CI
GitHub Actions builds the backend with Java 21 and frontend with Node 22, then runs the frontend linter.

## API
Auth: `POST /api/users/register`, `POST /api/users/login`, `GET /api/health`.
Resources: `/api/customers`, `/api/sites`, `/api/service-requests`, `/api/work-orders`, `/api/technicians`, `/api/schedules`, `/api/job-executions`, `/api/job-photos`, `/api/inventory`, `/api/part-usage`, `/api/invoices`, `/api/reports`.
Protected endpoints use `Authorization: Bearer <JWT>`.

## Seed data warning
The SQL file contains demo records with plaintext passwords. Do not use those passwords in production. Prefer application registration or BCrypt password hashes.

## Production checklist
- [ ] Create managed database and run schema
- [ ] Configure backend environment variables
- [ ] Configure Cloudinary if photos are required
- [ ] Deploy backend and verify `/api/health`
- [ ] Configure frontend API URL
- [ ] Set exact backend CORS origin
- [ ] Deploy frontend
- [ ] Test registration/login
- [ ] Test customer → service request → work order → schedule → technician execution
- [ ] Confirm GitHub Actions is green

## Screenshots
Add production screenshots here after deployment.