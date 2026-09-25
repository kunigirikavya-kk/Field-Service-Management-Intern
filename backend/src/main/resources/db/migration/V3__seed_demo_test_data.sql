-- Demo data for local/review environments only.
-- All demo users use the same password as the V1 demo users: Password123!

INSERT INTO users (username, password, email, full_name, phone, role) VALUES
('customer1@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'customer1@keystone.local', 'Aarav Sharma', '9000010001', 'CUSTOMER'),
('customer2@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'customer2@keystone.local', 'Priya Reddy', '9000010002', 'CUSTOMER'),
('customer3@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'customer3@keystone.local', 'Rahul Verma', '9000010003', 'CUSTOMER'),
('customer4@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'customer4@keystone.local', 'Sneha Patel', '9000010004', 'CUSTOMER'),
('tech1@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'tech1@keystone.local', 'Arjun Kumar', '9000020001', 'TECHNICIAN'),
('tech2@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'tech2@keystone.local', 'Meera Nair', '9000020002', 'TECHNICIAN'),
('tech3@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'tech3@keystone.local', 'Vikram Singh', '9000020003', 'TECHNICIAN'),
('tech4@keystone.local', '$2y$10$wi8ZQ6DIGZx3WErUDbcdpOi26wHSczmUzaPkEFO.jpfO4AYeMU9rq', 'tech4@keystone.local', 'Kiran Rao', '9000020004', 'TECHNICIAN');

INSERT INTO customers (user_id, company_name, contact_person, email, phone, address, city, state, zip_code)
SELECT id, 'Aarav Industries', 'Aarav Sharma', email, phone, '12 Tech Park Road', 'Hyderabad', 'Telangana', '500081'
FROM users WHERE email = 'customer1@keystone.local';

INSERT INTO customers (user_id, company_name, contact_person, email, phone, address, city, state, zip_code)
SELECT id, 'Reddy Retail Group', 'Priya Reddy', email, phone, '45 Market Street', 'Vijayawada', 'Andhra Pradesh', '520010'
FROM users WHERE email = 'customer2@keystone.local';

INSERT INTO customers (user_id, company_name, contact_person, email, phone, address, city, state, zip_code)
SELECT id, 'Verma Manufacturing', 'Rahul Verma', email, phone, '88 Industrial Area', 'Pune', 'Maharashtra', '411019'
FROM users WHERE email = 'customer3@keystone.local';

INSERT INTO customers (user_id, company_name, contact_person, email, phone, address, city, state, zip_code)
SELECT id, 'Patel Healthcare', 'Sneha Patel', email, phone, '7 Central Avenue', 'Bengaluru', 'Karnataka', '560001'
FROM users WHERE email = 'customer4@keystone.local';

INSERT INTO technicians (user_id, employee_code, full_name, email, phone, specialization, status, rating)
SELECT id, 'TECH-001', full_name, email, phone, 'HVAC & Cooling', 'AVAILABLE', 4.70
FROM users WHERE email = 'tech1@keystone.local';

INSERT INTO technicians (user_id, employee_code, full_name, email, phone, specialization, status, rating)
SELECT id, 'TECH-002', full_name, email, phone, 'Electrical Systems', 'AVAILABLE', 4.60
FROM users WHERE email = 'tech2@keystone.local';

INSERT INTO technicians (user_id, employee_code, full_name, email, phone, specialization, status, rating)
SELECT id, 'TECH-003', full_name, email, phone, 'Mechanical Maintenance', 'AVAILABLE', 4.80
FROM users WHERE email = 'tech3@keystone.local';

INSERT INTO technicians (user_id, employee_code, full_name, email, phone, specialization, status, rating)
SELECT id, 'TECH-004', full_name, email, phone, 'Network & Equipment', 'AVAILABLE', 4.50
FROM users WHERE email = 'tech4@keystone.local';

INSERT INTO sites (customer_id, site_name, contact_person, contact_phone, address, city, state, zip_code)
SELECT id, 'Aarav HQ', 'Aarav Sharma', '9000010001', '12 Tech Park Road', 'Hyderabad', 'Telangana', '500081'
FROM customers WHERE email = 'customer1@keystone.local';

INSERT INTO sites (customer_id, site_name, contact_person, contact_phone, address, city, state, zip_code)
SELECT id, 'Reddy Main Store', 'Priya Reddy', '9000010002', '45 Market Street', 'Vijayawada', 'Andhra Pradesh', '520010'
FROM customers WHERE email = 'customer2@keystone.local';

INSERT INTO sites (customer_id, site_name, contact_person, contact_phone, address, city, state, zip_code)
SELECT id, 'Verma Plant 1', 'Rahul Verma', '9000010003', '88 Industrial Area', 'Pune', 'Maharashtra', '411019'
FROM customers WHERE email = 'customer3@keystone.local';

INSERT INTO sites (customer_id, site_name, contact_person, contact_phone, address, city, state, zip_code)
SELECT id, 'Patel Clinic', 'Sneha Patel', '9000010004', '7 Central Avenue', 'Bengaluru', 'Karnataka', '560001'
FROM customers WHERE email = 'customer4@keystone.local';

INSERT INTO service_requests (customer_id, title, service_type, priority, preferred_date, service_location, description, status)
SELECT id, 'AC cooling issue', 'HVAC Maintenance', 'HIGH', CURRENT_DATE + 1, 'Aarav HQ', 'Main office AC is not cooling properly.', 'NEW'
FROM customers WHERE email = 'customer1@keystone.local';

INSERT INTO service_requests (customer_id, title, service_type, priority, preferred_date, service_location, description, status)
SELECT id, 'Electrical panel inspection', 'Electrical', 'MEDIUM', CURRENT_DATE + 2, 'Aarav HQ', 'Inspect breakers and electrical panel for intermittent trips.', 'NEW'
FROM customers WHERE email = 'customer1@keystone.local';

INSERT INTO service_requests (customer_id, title, service_type, priority, preferred_date, service_location, description, status)
SELECT id, 'POS terminal failure', 'Equipment Repair', 'URGENT', CURRENT_DATE, 'Reddy Main Store', 'Two POS terminals are not powering on.', 'NEW'
FROM customers WHERE email = 'customer2@keystone.local';

INSERT INTO service_requests (customer_id, title, service_type, priority, preferred_date, service_location, description, status)
SELECT id, 'Conveyor maintenance', 'Mechanical', 'MEDIUM', CURRENT_DATE + 3, 'Verma Plant 1', 'Routine inspection and lubrication of conveyor system.', 'NEW'
FROM customers WHERE email = 'customer3@keystone.local';

INSERT INTO service_requests (customer_id, title, service_type, priority, preferred_date, service_location, description, status)
SELECT id, 'Network equipment outage', 'Networking', 'HIGH', CURRENT_DATE + 1, 'Verma Plant 1', 'Network switch intermittently disconnects production devices.', 'NEW'
FROM customers WHERE email = 'customer3@keystone.local';

INSERT INTO service_requests (customer_id, title, service_type, priority, preferred_date, service_location, description, status)
SELECT id, 'Generator service', 'Generator Maintenance', 'LOW', CURRENT_DATE + 7, 'Patel Clinic', 'Schedule preventive generator inspection and service.', 'NEW'
FROM customers WHERE email = 'customer4@keystone.local';

INSERT INTO inventory_parts (part_number, part_name, category, quantity, minimum_stock, unit_price, supplier) VALUES
('PART-AC-001', 'AC Capacitor 35uF', 'HVAC', 25, 5, 850.00, 'HVAC Supplies India'),
('PART-AC-002', 'Copper Refrigerant Coil', 'HVAC', 12, 3, 2400.00, 'CoolTech Supplies'),
('PART-EL-001', 'MCB 32A', 'Electrical', 40, 10, 320.00, 'PowerSafe Electricals'),
('PART-EL-002', 'Contactor 25A', 'Electrical', 20, 5, 680.00, 'PowerSafe Electricals'),
('PART-ME-001', 'Bearing 6204', 'Mechanical', 30, 8, 450.00, 'Industrial Parts Co'),
('PART-ME-002', 'Drive Belt B-42', 'Mechanical', 18, 5, 720.00, 'Industrial Parts Co'),
('PART-NW-001', 'CAT6 Patch Cable', 'Networking', 60, 15, 180.00, 'Network World'),
('PART-NW-002', '8-Port Gigabit Switch', 'Networking', 10, 3, 1850.00, 'Network World'),
('PART-GN-001', 'Generator Oil Filter', 'Generator', 15, 4, 950.00, 'GenPower Services'),
('PART-GN-002', 'Generator Air Filter', 'Generator', 15, 4, 1250.00, 'GenPower Services');
