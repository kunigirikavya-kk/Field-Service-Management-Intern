// ServiceRequestRepository.java

package com.fsm.repository;

import com.fsm.entity.ServiceRequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequest, Long> {

}