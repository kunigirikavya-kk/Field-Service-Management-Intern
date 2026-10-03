package com.fsm.service;

import com.fsm.entity.Notification;
import com.fsm.repository.NotificationRepository;
import com.fsm.repository.UserRepository;
import com.fsm.entity.User;
import java.util.Set;
import com.fsm.security.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repository;
    private final AuthorizationService authorizationService;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository repository, AuthorizationService authorizationService, UserRepository userRepository) {
        this.repository = repository;
        this.authorizationService = authorizationService;
        this.userRepository = userRepository;
    }

    public Notification create(Long userId, String title, String message, String type) {
        Notification n = new Notification();
        n.setUserId(userId); n.setTitle(title); n.setMessage(message); n.setType(type);
        return repository.save(n);
    }

    public void notifyRoles(Set<String> roles, String title, String message, String type) {
        for (User user : userRepository.findAll()) {
            if (user.getRole() != null && roles.contains(user.getRole().name())) {
                if (!repository.existsByUserIdAndTitleAndMessage(user.getId(), title, message)) {
                    create(user.getId(), title, message, type);
                }
            }
        }
    }

    public List<Notification> mine() {
        return repository.findByUserIdOrderByCreatedAtDesc(authorizationService.getCurrentUserId());
    }

    public void markRead(Long id) {
        Notification n = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!n.getUserId().equals(authorizationService.getCurrentUserId()))
            throw new AccessDeniedException("You cannot modify another user's notification");
        n.setRead(true);
        repository.save(n);
    }
}