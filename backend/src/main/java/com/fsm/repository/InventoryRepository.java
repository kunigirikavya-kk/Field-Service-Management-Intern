package com.fsm.repository;

import com.fsm.entity.InventoryPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface InventoryRepository
        extends JpaRepository<InventoryPart, Long> {

    Optional<InventoryPart> findByPartNumber(String partNumber);

    boolean existsByPartNumber(String partNumber);

    boolean existsByPartNumberAndIdNot(
            String partNumber,
            Long id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from InventoryPart p where p.id = :id")
    Optional<InventoryPart> findByIdForUpdate(@Param("id") Long id);
}