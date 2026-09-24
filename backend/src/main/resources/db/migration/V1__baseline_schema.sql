CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    company_name VARCHAR(150),
    contact_person VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(80),
    state VARCHAR(80),
    zip_code VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE technicians (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    employee_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(30),
    specialization VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sites (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    site_name VARCHAR(150),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(80),
    state VARCHAR(80),
    zip_code VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_requests (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    preferred_date DATE,
    service_location VARCHAR(255),
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_orders (
    id BIGSERIAL PRIMARY KEY,
    service_request_id BIGINT REFERENCES service_requests(id) ON DELETE SET NULL,
    technician_id BIGINT REFERENCES technicians(id) ON DELETE SET NULL,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150),
    service_type VARCHAR(50),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    parts_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    labour_minutes INTEGER NOT NULL DEFAULT 0,
    sla_due_at TIMESTAMP,
    sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
    sla_breach_notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_orders_customer ON work_orders(customer_id);
CREATE INDEX idx_work_orders_technician ON work_orders(technician_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_sla ON work_orders(sla_due_at, sla_breached);

CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_technician_date ON schedules(technician_id, scheduled_date);

CREATE TABLE job_executions (
    id BIGSERIAL PRIMARY KEY,
    schedule_id BIGINT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    work_notes TEXT,
    parts_used TEXT,
    completion_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_parts (
    id BIGSERIAL PRIMARY KEY,
    part_number VARCHAR(100) NOT NULL UNIQUE,
    part_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    supplier VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE part_usages (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    job_execution_id BIGINT REFERENCES job_executions(id) ON DELETE SET NULL,
    technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
    inventory_part_id BIGINT NOT NULL REFERENCES inventory_parts(id) ON DELETE RESTRICT,
    quantity_used INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_part_usage_work_order ON part_usages(work_order_id);

CREATE TABLE time_logs (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
    minutes INTEGER NOT NULL CHECK (minutes > 0),
    note TEXT,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_time_logs_work_order ON time_logs(work_order_id);

CREATE TABLE job_photos (
    id BIGSERIAL PRIMARY KEY,
    job_execution_id BIGINT REFERENCES job_executions(id) ON DELETE SET NULL,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
    image_url TEXT NOT NULL,
    public_id VARCHAR(255),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE RESTRICT,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    invoice_date TIMESTAMP,
    due_date TIMESTAMP,
    service_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    payment_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE work_order_status_history (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

CREATE INDEX idx_status_history_work_order ON work_order_status_history(work_order_id, changed_at);

-- Demo users for local/review environments only. Password: Password123!
INSERT INTO users (username, password, email, full_name, phone, role) VALUES
('dispatcher@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'dispatcher@keystone.local', 'KEYSTONE Dispatcher', '9000000001', 'DISPATCHER'),
('manager@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'manager@keystone.local', 'KEYSTONE Manager', '9000000002', 'MANAGER'),
('technician@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'technician@keystone.local', 'KEYSTONE Technician', '9000000003', 'TECHNICIAN'),
('customer@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'customer@keystone.local', 'KEYSTONE Customer', '9000000004', 'CUSTOMER');

INSERT INTO customers (user_id, company_name, contact_person, email, phone, city, state)
SELECT id, 'KEYSTONE Demo Customer', 'KEYSTONE Customer', email, phone, 'Hyderabad', 'Telangana'
FROM users WHERE email = 'customer@keystone.local';

INSERT INTO technicians (user_id, employee_code, full_name, email, phone, specialization, status, rating)
SELECT id, 'TECH-DEMO-001', full_name, email, phone, 'General Maintenance', 'AVAILABLE', 4.50
FROM users WHERE email = 'technician@keystone.local';

INSERT INTO sites (customer_id, site_name, contact_person, contact_phone, address, city, state)
SELECT id, 'Demo Commercial Site', 'KEYSTONE Customer', '9000000004', 'Demo Address', 'Hyderabad', 'Telangana'
FROM customers WHERE email = 'customer@keystone.local';
