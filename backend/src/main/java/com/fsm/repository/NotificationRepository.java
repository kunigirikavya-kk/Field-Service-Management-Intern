package com.fsm.repository;
import com.fsm.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndTitleAndMessage(Long userId, String title, String message);
}