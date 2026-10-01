ALTER TABLE job_photos ALTER COLUMN work_order_id DROP NOT NULL;
ALTER TABLE job_photos ALTER COLUMN technician_id DROP NOT NULL;
ALTER TABLE job_photos ADD COLUMN service_request_id BIGINT REFERENCES service_requests(id) ON DELETE CASCADE;
ALTER TABLE job_photos ADD COLUMN photo_type VARCHAR(30) NOT NULL DEFAULT 'WORK_COMPLETION';
CREATE INDEX idx_job_photos_service_request ON job_photos(service_request_id);
CREATE INDEX idx_job_photos_type ON job_photos(photo_type);
