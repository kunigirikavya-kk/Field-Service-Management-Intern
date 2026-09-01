package com.fsm.repository;

import com.fsm.entity.JobPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPhotoRepository
        extends JpaRepository<JobPhoto, Long> {

    List<JobPhoto> findByJobExecutionId(
            Long jobExecutionId
    );

    List<JobPhoto> findByWorkOrderId(
            Long workOrderId
    );

    List<JobPhoto> findByTechnicianId(
            Long technicianId
    );
}