package com.fsm.repository;

import com.fsm.entity.InventoryPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository
        extends JpaRepository<InventoryPart, Long> {

    Optional<InventoryPart> findByPartNumber(String partNumber);
}