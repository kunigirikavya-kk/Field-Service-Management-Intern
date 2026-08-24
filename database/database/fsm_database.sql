DROP DATABASE IF EXISTS field_service_management;
CREATE DATABASE field_service_management;
USE field_service_management;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    role ENUM('ADMIN','MANAGER','TECHNICIAN','CUSTOMER') DEFAULT 'CUSTOMER',
    phone VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    company_name VARCHAR(150),
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(80),
    state VARCHAR(80),
    zip_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE technicians (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    employee_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    specialization VARCHAR(100),
    status ENUM('AVAILABLE','BUSY','OFF_DUTY') DEFAULT 'AVAILABLE',
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    priority ENUM('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM',
    status ENUM('NEW','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'NEW',
    requested_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE work_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT,
    technician_id BIGINT,
    customer_id BIGINT,
    order_number VARCHAR(50) UNIQUE,
    description TEXT,
    status ENUM('PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    scheduled_date DATETIME,
    completed_date DATETIME,
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT,
    technician_id BIGINT,
    customer_id BIGINT,
    start_time DATETIME,
    end_time DATETIME,
    location VARCHAR(255),
    status ENUM('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED') DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_code VARCHAR(50) UNIQUE,
    part_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(80),
    quantity INT DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    reorder_level INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    inventory_id BIGINT NOT NULL,
    quantity_used INT DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT,
    customer_id BIGINT,
    invoice_number VARCHAR(50) UNIQUE,
    issue_date DATE,
    due_date DATE,
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('DRAFT','SENT','PAID','OVERDUE','CANCELLED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    payment_method ENUM('CASH','CARD','BANK_TRANSFER','UPI','CHEQUE') DEFAULT 'CASH',
    transaction_ref VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(150),
    message TEXT,
    type ENUM('INFO','WARNING','SUCCESS','ERROR') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SAMPLE DATA
INSERT INTO users (username, password, email, full_name, role, phone) VALUES
('admin', 'admin123', 'admin@fsm.com', 'System Admin', 'ADMIN', '9876543210'),
('john_tech', 'tech123', 'john@fsm.com', 'John Smith', 'TECHNICIAN', '9876543211'),
('acme_corp', 'cust123', 'contact@acme.com', 'Acme Corp', 'CUSTOMER', '9876543212');

INSERT INTO customers (user_id, company_name, contact_person, email, phone, address, city, state, zip_code) VALUES
(3, 'Acme Corporation', 'Jane Doe', 'contact@acme.com', '9876543212', '123 Main St', 'Bangalore', 'Karnataka', '560001');

INSERT INTO technicians (user_id, employee_code, full_name, email, phone, specialization, status, rating) VALUES
(2, 'TECH001', 'John Smith', 'john@fsm.com', '9876543211', 'HVAC Repair', 'AVAILABLE', 4.50);

INSERT INTO inventory (part_code, part_name, description, category, quantity, unit_price, reorder_level) VALUES
('P001', 'Air Filter', 'HEPA air filter', 'HVAC', 50, 450.00, 10),
('P002', 'Compressor Unit', 'AC compressor', 'HVAC', 8, 12500.00, 5),
('P003', 'Copper Pipe 1m', 'Refrigerant copper pipe', 'PLUMBING', 100, 320.00, 20);

INSERT INTO service_requests (customer_id, title, description, priority, status, requested_date) VALUES
(1, 'AC Not Cooling', 'Office AC unit not cooling properly', 'HIGH', 'NEW', CURDATE());