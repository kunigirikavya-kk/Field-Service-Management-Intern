-- Keep the JPA technician model and PostgreSQL schema aligned.
ALTER TABLE technicians
    ADD COLUMN name VARCHAR(100);
