
# Field Service Management System (FieldSync)

<p align="center">
  <strong>A full-stack field operations product for managing service requests, technicians, work orders, inventory, job evidence and approvals in one connected workflow.</strong>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black">
  <img alt="Java" src="https://img.shields.io/badge/Backend-Java%2021%20%2B%20Spring%20Boot-6DB33F?logo=springboot&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white">
  <img alt="Deployment" src="https://img.shields.io/badge/Deployment-Vercel%20%2B%20Render-black">
</p>

<p align="center">
  <a href="https://field-service-management-intern.vercel.app">Live Application</a> •
  <a href="https://github.com/kunigirikavya-kk/Field-Service-Management-Intern">Source Code</a> •
  <a href="https://fieldsync-backend-lyp0.onrender.com">Backend</a>
</p>

---

## 🚀 Product Overview

**Field Service Management System (FieldSync)** is a full-stack field service management product designed to help service organizations coordinate the complete lifecycle of field work in one place.

Instead of managing customers, service requests, technicians, schedules, work orders, inventory, labour, photos and billing across disconnected tools, FieldSync brings these operations into a single role-aware platform.

The product is built around one simple operational flow:

> **Customer Request → Dispatcher Coordination → Technician Execution → Manager Close-out**

FieldSync is designed as a practical product concept for organizations that send technicians to customer locations to install, inspect, repair or maintain equipment and systems.

### Who can benefit from FieldSync?

FieldSync is suitable for teams such as:

- Field service and maintenance companies
- Equipment repair and maintenance businesses
- HVAC, electrical and plumbing service operations
- Facility and property maintenance teams
- Technical installation and inspection teams
- Service coordinators and dispatch operations
- Organizations that need visibility into technician jobs, parts and service costs

The platform is especially useful when a business needs to move from spreadsheet/manual coordination toward a centralized digital workflow.

---

## 💼 Product Offering

Field Service Management System is positioned as a configurable software solution for service businesses that want to centralize daily field operations. The current repository demonstrates the core product workflow; commercial onboarding, pricing, support terms and customer-specific integrations would be agreed separately.

**Potential adoption options**
- **Use as a product foundation:** adapt workflows, branding and configuration to an organization's operating model.
- **Business workflow customization:** tailor service categories, roles, approval rules and reporting requirements.
- **Integration planning:** assess connections to existing customer, billing or enterprise systems before implementation.

To discuss adapting this project, start a conversation through the [GitHub repository](https://github.com/kunigirikavya-kk/Field-Service-Management-Intern/issues). This repository does not currently publish pricing, a purchase checkout or a commercial support agreement.

---

## 💡 The Product Value

FieldSync is not just a CRUD application. The project was designed around the operational problems a real service business faces.

### For Customers
- Raise service requests without contacting multiple people.
- Track their own service activity and work orders.
- See meaningful job status without exposing internal operational data.

### For Dispatchers
- Maintain customer and technician information.
- Convert service requests into organized work orders.
- Assign technicians and coordinate schedules.
- Monitor field activity from one dashboard.

### For Technicians
- See only assigned work.
- Execute jobs through a governed lifecycle.
- Record labour/time spent.
- Record parts consumed.
- Upload completion photos as field evidence.

### For Managers
- Monitor operational workload.
- See technician availability.
- Monitor unassigned requests and SLA risk.
- Review completed work.
- Perform the final **COMPLETED → CLOSED** approval step.

### For the Business
- Centralized operational visibility
- Better traceability of field work
- Controlled inventory consumption
- Labour and parts cost tracking
- Customer data isolation
- Role-based operational control
- Production-ready deployment architecture

---

## ✨ Core Features

### 🔐 Authentication & Role-Based Access
- JWT-based authentication
- BCrypt password hashing
- Four business roles:
  - Customer
  - Dispatcher
  - Technician
  - Manager
- Server-side authorization
- Server-side ownership enforcement
- Role-aware navigation and dashboards

> The React frontend is not treated as the security boundary. Authorization is enforced on the backend.

### 👥 Customer Management
- Customer records
- Customer sites
- Ownership-aware service requests
- Customer-specific work-order access
- Internal work-order information hidden from customer responses

### 📨 Service Requests
- Customer service-request creation
- Dispatcher request visibility
- Request ownership protection
- Request-to-work-order operational flow

### 🧾 Work Order Management
- Work-order creation and editing while open
- Human-readable unique work-order numbers
- Technician assignment/reassignment
- Priority and scheduling
- Governed lifecycle
- Status history
- Customer-specific views
- Technician-specific views
- Manager close-out

### 🔄 Work-Order Lifecycle

~~~text
NEW
 ↓
ASSIGNED
 ↓
IN_PROGRESS
 ↓
ON_HOLD
 ↓
IN_PROGRESS
 ↓
COMPLETED
 ↓
CLOSED
~~~

Cancellation is supported from the appropriate early lifecycle states.

The lifecycle is deliberately controlled instead of allowing arbitrary status jumps.

### 🧑‍🔧 Technician Job Execution
- Assigned-job workspace
- Start / hold / resume / complete workflow
- Labour/time logging
- Parts usage
- Inventory deduction
- Completion photo upload
- Execution history

### 📦 Inventory & Parts
- Part catalogue
- Stock quantity
- Unit pricing
- Technician part usage
- Transactional stock deduction
- Pessimistic row locking
- Protection against negative stock
- Parts-cost rollup on work orders

### ⏱️ Labour & Time Tracking
- Technician time logging
- Labour-minute tracking
- Work-order labour rollups
- Role-restricted time entry

### 📅 Scheduling
- Scheduled service activity
- Technician schedule visibility
- Dispatcher coordination
- Dashboard schedule summaries

### 💰 Billing
- Invoice visibility
- Payment status
- Work-order cost information
- Parts and labour cost rollups

### 🚨 SLA Monitoring
Configurable SLA targets by priority:

| Priority | SLA |
|---|---:|
| LOW | 72 hours |
| MEDIUM | 24 hours |
| HIGH | 8 hours |
| URGENT | 4 hours |

Managers can monitor SLA risk and operational status from the Manager Dashboard.

### 📊 Operational Dashboards
Each role gets a different dashboard designed around its responsibilities.

| Role | Dashboard Focus |
|---|---|
| Customer | Own service activity and work orders |
| Dispatcher | Customers, technicians, requests, work orders and field activity |
| Technician | Assigned jobs, schedules, execution and inventory |
| Manager | Operations, SLA, availability and close-out |

### 📸 Cloudinary Photo Storage
Technicians can upload job-completion photos through the Job Execution workflow.

Images are stored using Cloudinary rather than directly inside PostgreSQL.

### 📖 OpenAPI / Swagger
The backend exposes OpenAPI documentation and Swagger UI for API exploration.

---

# 🏗️ Architecture

FieldSync follows a layered full-stack architecture.

### System Architecture

~~~mermaid
flowchart TB
    subgraph PEOPLE["1. USERS & ROLE-BASED EXPERIENCE"]
        CU["Customer"]
        DI["Dispatcher"]
        TE["Technician"]
        MA["Manager"]
    end

    subgraph FRONTEND["2. PRESENTATION LAYER — VERCEL"]
        WEB["React 19 + Vite"]
        ROUTE["React Router • Role-aware pages"]
        UI["Dashboards • Requests • Work Orders<br/>Scheduling • Execution • Inventory • Billing"]
        WEB --> ROUTE --> UI
    end

    subgraph BACKEND["3. APPLICATION LAYER — RENDER"]
        API["Spring Boot REST API"]
        AUTH["Spring Security + JWT<br/>Authentication & Authorization"]
        CTRL["Controllers + DTO Validation"]
        SERVICE["Business Services<br/>Lifecycle • Assignment • SLA • Costs"]
        DATA["Spring Data JPA / Hibernate"]
        API --> AUTH --> CTRL --> SERVICE --> DATA
    end

    subgraph DATA_LAYER["4. DATA & FILE STORAGE"]
        DB[("PostgreSQL<br/>Operational Records")]
        MIG["Flyway<br/>Versioned Migrations"]
        CLOUD["Cloudinary<br/>Customer & Completion Photos"]
        DATA --> DB
        MIG -. schema versioning .-> DB
        SERVICE --> CLOUD
    end

    CU --> WEB
    DI --> WEB
    TE --> WEB
    MA --> WEB
    UI <-->|HTTPS REST / JSON| API

    classDef people fill:#eef2ff,stroke:#6366f1,color:#172554
    classDef frontend fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef storage fill:#fef3c7,stroke:#d97706,color:#78350f
    class CU,DI,TE,MA people
    class WEB,ROUTE,UI frontend
    class API,AUTH,CTRL,SERVICE,DATA backend
    class DB,MIG,CLOUD storage
~~~ 

### Operational Workflow

~~~mermaid
flowchart LR
    A["Customer submits<br/>service request + issue photo"]
    B["Dispatcher reviews<br/>and creates work order"]
    C["Technician is assigned<br/>and scheduled"]
    D["Technician performs work<br/>logs time and parts"]
    E["Completion evidence<br/>is uploaded"]
    F["Manager reviews<br/>and closes work order"]

    A --> B --> C --> D --> E --> F
~~~

### Architecture at a Glance

| Layer | Responsibility | Technology |
|---|---|---|
| User experience | Role-based screens and operational dashboards | React, Vite, React Router |
| API & security | REST endpoints, authentication, authorization and validation | Spring Boot, Spring Security, JWT |
| Business logic | Work-order lifecycle, assignment, SLA, inventory and cost rules | Java service layer |
| Persistence | Relational records and transactions | Spring Data JPA, Hibernate, PostgreSQL |
| Schema management | Version-controlled database changes | Flyway |
| Image storage | Customer issue and technician completion evidence | Cloudinary |
| Hosting | Frontend and backend deployment | Vercel, Render |

### Request Flow

~~~text
Browser
   ↓
React / Vite
   ↓
REST API
   ↓
Spring Boot Controllers
   ↓
Business Services
   ↓
JPA / Hibernate
   ↓
PostgreSQL
~~~

### Production Infrastructure

- **Vercel** → React frontend
- **Render** → Spring Boot backend
- **PostgreSQL** → Production relational database
- **Cloudinary** → Execution image storage
- **Flyway** → Versioned database migrations

---

# 🧰 Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React 19 | Component-based UI |
| Vite 8 | Development and production build tooling |
| React Router | Client-side routing |
| Recharts | Dashboard visualizations |
| Lucide React | UI icons |
| CSS / responsive UI | Design system and layouts |
| Oxlint | Frontend linting |

## Backend

| Technology | Purpose |
|---|---|
| Java 21 | Backend language |
| Spring Boot 3.5.16 | Application framework |
| Spring Web | REST APIs |
| Spring Data JPA | Persistence |
| Hibernate | ORM |
| Spring Security | Security and authorization |
| JWT / JJWT | Authentication tokens |
| Bean Validation | Request validation |
| Springdoc OpenAPI | Swagger / API documentation |
| Lombok | Boilerplate reduction |

## Data & Infrastructure

| Technology | Purpose |
|---|---|
| PostgreSQL 17 | Relational database |
| Flyway | Database migrations |
| Cloudinary | Image storage |
| Docker Compose | Complete local stack |
| Testcontainers | PostgreSQL integration testing |
| GitHub Actions | CI / validation |
| Vercel | Frontend deployment |
| Render | Backend deployment |

---

# 👤 Role-Based Product Design

## Customer

**Primary goal:** Request and track service.

Customer capabilities include:

- Login
- Create service requests
- View own work orders
- View service status
- View permitted service information

Customers cannot use the application to access another customer's service data.

---

## Dispatcher

**Primary goal:** Coordinate field operations.

Dispatcher capabilities include:

- Manage customers
- Manage technicians
- View service requests
- Create work orders
- Assign technicians
- Reassign technicians where permitted
- Schedule service
- Monitor operational activity
- View inventory and billing information

---

## Technician

**Primary goal:** Execute field work.

Technician capabilities include:

- View assigned work orders
- Start work
- Put work on hold
- Resume work
- Complete work
- Log labour time
- Record parts used
- Upload completion photos
- View schedule
- Access technician-relevant inventory information

---

## Manager

**Primary goal:** Monitor operations and approve completion.

Manager capabilities include:

- View operational metrics
- Monitor unassigned requests
- Monitor SLA risk
- View technician availability
- Review completed work
- Close completed work orders

The Manager Dashboard intentionally focuses on **oversight rather than technician execution**.

---

# 🔒 Security & Data Protection

Security was treated as a backend responsibility throughout the project.

### Customer Isolation

Customer data is protected server-side.

The application does not simply trust a customer ID supplied by the browser. Customer ownership is resolved through the authenticated user context.

This was explicitly tested by logging in as a second customer and confirming that the first customer's work order was not visible.

### Role Restrictions

Examples include:

- Technician-only part usage
- Technician-only time logging
- Manager-only work-order close-out
- Restricted dispatcher status transitions
- Customer-only ownership views
- Protected work-order history

### Secret Management

Production secrets are supplied through environment variables.

Examples:

- Database credentials
- JWT secret
- Cloudinary credentials
- CORS configuration
- SLA configuration

**Real secrets should never be committed to Git.**

---

# 🗄️ Database Design

PostgreSQL is the authoritative relational database.

Major data domains include:

- Users
- Customers
- Customer sites
- Technicians
- Service requests
- Work orders
- Work-order history
- Schedules
- Inventory parts
- Part usage
- Time logs
- Notifications
- Reports
- Invoices / billing

### Database Migration Strategy

Flyway manages the database schema through versioned migrations.

Production uses:

~~~properties
spring.jpa.hibernate.ddl-auto=validate
~~~

This means Hibernate validates the schema instead of silently modifying the production database structure.

---

# 🔌 API Surface

Major backend endpoints include:

~~~text
POST   /api/users/login
POST   /api/users/register

GET    /api/customers
POST   /api/customers

GET    /api/sites/customer/{customerId}
POST   /api/sites/customer/{customerId}

GET    /api/service-requests
POST   /api/service-requests

GET    /api/work-orders
POST   /api/work-orders
GET    /api/work-orders/page

GET    /api/work-orders/{id}
PUT    /api/work-orders/{id}

POST   /api/work-orders/{id}/assign
POST   /api/work-orders/{id}/status
GET    /api/work-orders/{id}/history

POST   /api/part-usage
POST   /api/time-logs

GET    /api/notifications
GET    /api/reports/summary

GET    /swagger-ui.html
GET    /v3/api-docs
~~~

API errors use a consistent JSON response structure containing information such as timestamp, HTTP status, message and field-level errors.

---

# 🧪 Testing & Quality Assurance

The project was validated at both backend and production levels.

## Automated Testing

The backend includes PostgreSQL-backed integration testing using Testcontainers.

The role E2E suite covers scenarios such as:

- Authentication
- Dispatcher assignment
- Technician lifecycle
- Manager close-out
- Customer isolation
- Work-order history protection
- Manager reporting
- Inventory deduction/restoration
- Parts costs
- Labour minutes
- Role-restricted operations

## Production QA

The deployed application was manually tested using all four roles.

| Area | Result |
|---|---|
| Customer Login / Dashboard | ✅ PASS |
| Customer Isolation | ✅ PASS |
| Customer Work Orders | ✅ PASS |
| Dispatcher Dashboard | ✅ PASS |
| Customers | ✅ PASS |
| Technicians | ✅ PASS |
| Service Requests | ✅ PASS |
| Work Orders | ✅ PASS |
| Schedule | ✅ PASS |
| Inventory | ✅ PASS |
| Billing | ✅ PASS |
| Technician Dashboard | ✅ PASS |
| Job Execution | ✅ PASS |
| Photo Upload | ✅ PASS |
| Parts Usage | ✅ PASS |
| Time Logging | ✅ PASS |
| Manager Dashboard | ✅ PASS |
| Manager Close-out | ✅ PASS |
| Vercel Frontend | ✅ PASS |
| Render Backend | ✅ PASS |

---

# 🚀 Production Deployment

### Live Application

**https://field-service-management-intern.vercel.app**

### Backend

**https://fieldsync-backend-lyp0.onrender.com**

### Source Code

**https://github.com/kunigirikavya-kk/Field-Service-Management-Intern**

### Deployment Architecture

~~~text
GitHub main
    │
    ├──→ Vercel
    │      └── React + Vite Frontend
    │
    └──→ Render
           └── Spring Boot Backend
                    │
                    └── PostgreSQL
~~~

The frontend uses:

~~~text
VITE_API_BASE_URL
~~~

The backend uses environment configuration for database credentials, JWT, CORS, Flyway, Cloudinary and SLA settings.

---

# 🖥️ Running the Project Locally

## Option 1 — Docker Compose

Copy the environment template:

~~~bash
cp .env.example .env
~~~

Then:

~~~bash
docker compose up --build
~~~

Open:

- Frontend → http://localhost:5174
- API health → http://localhost:8080/api/health
- Swagger → http://localhost:8080/swagger-ui.html
- OpenAPI → http://localhost:8080/v3/api-docs

## Option 2 — Manual Development

### Backend

~~~bash
cd backend
mvn spring-boot:run
~~~

Configure PostgreSQL and the required environment variables before starting.

### Frontend

~~~bash
cd frontend/fsm-frontend
npm ci
npm run dev
~~~

For production checks:

~~~bash
npm run lint
npm run build
~~~

---

# 🔑 Demo Accounts

These accounts are intended for local/review environments.

| Role | Email | Password |
|---|---|---|
| Dispatcher | dispatcher@keystone.local | Password123! |
| Manager | manager@keystone.local | Password123! |
| Technician | technician@keystone.local | Password123! |
| Customer | customer@keystone.local | Password123! |

> Do not use seeded demo credentials as production credentials.

---

# 📁 Project Structure

~~~text
Field-Service-Management-Intern/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       └── db/migration/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   └── fsm-frontend/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── services/
│       ├── package.json
│       ├── vite.config.js
│       └── vercel.json
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── .env.example
└── README.md
~~~

---

# 🧠 My Engineering Journey

FieldSync started as a full-stack academic project and evolved into a deployed product-style application.

The biggest learning curve was not simply writing individual features. It was understanding how all parts of a real application have to work together:

~~~text
UI
 ↓
API
 ↓
Business Rules
 ↓
Database
 ↓
Authentication
 ↓
Deployment
 ↓
Production QA
~~~

### What I learned

- How to structure a full-stack React + Spring Boot application.
- How REST APIs connect frontend workflows with backend business logic.
- How PostgreSQL relationships and foreign keys affect application behavior.
- How Flyway migrations keep database changes controlled.
- How JWT authentication and role-based authorization work.
- Why frontend restrictions alone are not security.
- How customer ownership must be enforced server-side.
- How transactional inventory updates prevent inconsistent stock.
- How work-order state machines prevent invalid lifecycle transitions.
- How Cloudinary can be integrated for production image storage.
- How CORS affects deployed frontend/backend communication.
- How environment variables separate code from deployment configuration.
- How automated integration tests differ from browser-level production testing.
- How deployment problems can involve infrastructure, configuration and application code at the same time.

---

# 🧩 Challenges I Faced

## 1. PostgreSQL Authentication

The backend initially failed because the PostgreSQL credentials did not match the application's configuration.

**Learning:** database configuration is part of application deployment, not an afterthought.

## 2. Maven / Java Environment

The local Maven wrapper had bootstrap problems and required repair before the backend could be reliably started.

**Learning:** build tooling and reproducible development environments matter in full-stack projects.

## 3. Frontend ↔ Backend Connectivity

The browser initially attempted direct API calls to the backend and produced connection-refused errors.

**Solution:** the frontend was configured with a Vite /api development proxy and environment-aware production API configuration.

**Learning:** local and production networking are different environments and need explicit configuration.

## 4. Database Migrations

Schema changes and existing database state caused migration/validation issues during development.

**Solution:** Flyway migrations became the controlled source of schema evolution.

**Learning:** database versioning is essential for a deployable application.

## 5. Work-Order Lifecycle

Status values had to remain consistent between frontend strings and backend Java enums.

**Solution:** the lifecycle and authorization rules were aligned between API and UI.

**Learning:** business workflows should be modeled explicitly instead of treating status as an unrestricted string.

## 6. Inventory Integrity

Parts usage needed to update stock without allowing negative inventory.

**Solution:** transactional updates and pessimistic row locking were implemented.

**Learning:** financial and inventory operations require stronger consistency guarantees than simple CRUD.

## 7. Cloudinary Upload

Photo upload initially failed because of Cloudinary configuration.

**Solution:** Cloudinary credentials were moved to environment-based configuration and the production upload workflow was verified.

**Learning:** third-party integrations depend heavily on correct production configuration.

## 8. Production Dashboard Validation

The Customer and Technician dashboards initially classified CLOSED work orders incorrectly.

**Solution:** dashboard calculations were updated so:

~~~text
Active = not COMPLETED / CLOSED / CANCELLED

Completed = COMPLETED or CLOSED
~~~

**Learning:** a feature can be technically functional while still producing incorrect business metrics.

---

# 📈 Product Roadmap

Future versions of FieldSync could include:

- 📱 Native technician mobile application
- 🗺️ Map-based route planning
- 🔔 Push notifications
- 📧 Email/SMS/WhatsApp notifications
- 💳 Online customer payments
- 📊 Advanced analytics and business intelligence
- 🧾 Advanced invoicing
- 🧑‍💼 More granular organization/admin roles
- 📍 GPS-based technician tracking
- 📶 Offline-first technician workflows
- 📝 Expanded audit trails
- 💾 Automated backup and disaster recovery
- 🤖 AI-assisted service classification and technician assignment

These are future product opportunities, not claims about functionality currently implemented.

---

# 🎯 Why FieldSync?

FieldSync is built around a practical idea:

> **Field service operations should be visible, traceable and manageable from one system.**

A service request should not disappear into a spreadsheet.

A technician should not need separate tools for the job, time, parts and evidence.

A manager should not have to manually determine which jobs are ready for closure.

A customer should not have access to another customer's information.

FieldSync connects these workflows into one product.

---

# 📌 Project Highlights

- ✅ Full-stack production application
- ✅ React + Spring Boot architecture
- ✅ Java 21
- ✅ PostgreSQL + Flyway
- ✅ JWT authentication
- ✅ Four role-based experiences
- ✅ Customer data isolation
- ✅ Work-order lifecycle management
- ✅ Technician execution
- ✅ Inventory and parts tracking
- ✅ Labour/time tracking
- ✅ Billing
- ✅ SLA monitoring
- ✅ Cloudinary photo upload
- ✅ OpenAPI / Swagger
- ✅ Automated PostgreSQL E2E testing
- ✅ Production QA across all roles
- ✅ Vercel deployment
- ✅ Render deployment

---

# 📚 API Documentation

When the backend is running:

**Swagger UI**

~~~text
http://localhost:8080/swagger-ui.html
~~~

**OpenAPI JSON**

~~~text
http://localhost:8080/v3/api-docs
~~~

---

# 📝 Project Information

**Project Name:** Field Service Management System (FieldSync)  
**Domain:** Field Service Management  
**Architecture:** Full-stack client-server application  
**Frontend:** React + Vite  
**Backend:** Spring Boot 3 + Java 21  
**Database:** PostgreSQL  
**Migration:** Flyway  
**Authentication:** JWT / Spring Security  
**Image Storage:** Cloudinary  
**Frontend Hosting:** Vercel  
**Backend Hosting:** Render  

---

# 🔗 Links

| Resource | Link |
|---|---|
| 🌐 Live Application | https://field-service-management-intern.vercel.app |
| 💻 GitHub Repository | https://github.com/kunigirikavya-kk/Field-Service-Management-Intern |
| ⚙️ Backend | https://fieldsync-backend-lyp0.onrender.com |

---

## 🙌 Final Note

FieldSync represents my journey from building individual full-stack features to understanding how a complete software product is designed, secured, tested, deployed and presented.

The project taught me that building a product is not only about making the UI work. It is about connecting **users, workflows, business rules, data, security, testing and infrastructure** into one reliable system.

> **FieldSync — Connect the request. Coordinate the work. Complete the service.**
