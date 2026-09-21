package com.fsm.repository;

import com.fsm.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {

    List<Site> findByCustomerId(Long customerId);

    boolean existsByCustomerIdAndSiteNameIgnoreCase(
            Long customerId,
            String siteName
    );

    boolean existsByCustomerIdAndSiteNameIgnoreCaseAndIdNot(
            Long customerId,
            String siteName,
            Long id
    );
}