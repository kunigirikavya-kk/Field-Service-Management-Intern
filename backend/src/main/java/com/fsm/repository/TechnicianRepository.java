
package com.fsm.repository;

import com.fsm.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {

    List<Technician> findByStatus(String status);

    List<Technician> findBySpecialization(String specialization);

    List<Technician> findByStatusAndSpecialization(
            String status,
            String specialization
    );
}

