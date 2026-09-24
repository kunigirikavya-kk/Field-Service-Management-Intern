package com.fsm.service;

import com.fsm.entity.WorkOrder;
import com.fsm.repository.SiteRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.security.AuthorizationService;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WorkOrderServiceTest {

    private WorkOrderService service(WorkOrderRepository repo, AuthorizationService auth) {
        return new WorkOrderService(
                repo,
                mock(SiteRepository.class),
                auth,
                mock(WorkOrderStatusHistoryService.class),
                mock(SlaService.class)
        );
    }

    @Test
    void technicianCanCompleteAssignedInProgressJob() {
        WorkOrderRepository repo = mock(WorkOrderRepository.class);
        AuthorizationService auth = mock(AuthorizationService.class);
        WorkOrder order = new WorkOrder();
        order.setId(1L);
        order.setStatus(WorkOrder.Status.IN_PROGRESS);
        order.setTechnicianId(7L);

        when(repo.findById(1L)).thenReturn(Optional.of(order));
        when(auth.hasRole("TECHNICIAN")).thenReturn(true);
        when(auth.getCurrentTechnicianId()).thenReturn(7L);
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        WorkOrder saved = service(repo, auth).updateStatus(1L, WorkOrder.Status.COMPLETED);

        assertEquals(WorkOrder.Status.COMPLETED, saved.getStatus());
        assertNotNull(saved.getCompletedDate());
    }

    @Test
    void illegalNewToCompletedTransitionIsRejected() {
        WorkOrderRepository repo = mock(WorkOrderRepository.class);
        AuthorizationService auth = mock(AuthorizationService.class);
        WorkOrder order = new WorkOrder();
        order.setId(1L);
        order.setStatus(WorkOrder.Status.NEW);
        order.setTechnicianId(7L);

        when(repo.findById(1L)).thenReturn(Optional.of(order));
        when(auth.hasRole("TECHNICIAN")).thenReturn(true);
        when(auth.getCurrentTechnicianId()).thenReturn(7L);

        assertThrows(IllegalStateException.class,
                () -> service(repo, auth).updateStatus(1L, WorkOrder.Status.COMPLETED));
    }

    @Test
    void technicianCannotUpdateAnotherTechniciansJob() {
        WorkOrderRepository repo = mock(WorkOrderRepository.class);
        AuthorizationService auth = mock(AuthorizationService.class);
        WorkOrder order = new WorkOrder();
        order.setId(1L);
        order.setStatus(WorkOrder.Status.IN_PROGRESS);
        order.setTechnicianId(7L);

        when(repo.findById(1L)).thenReturn(Optional.of(order));
        when(auth.hasRole("TECHNICIAN")).thenReturn(true);
        when(auth.getCurrentTechnicianId()).thenReturn(99L);

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> service(repo, auth).updateStatus(1L, WorkOrder.Status.COMPLETED));
    }

    @Test
    void managerCanCloseOnlyCompletedJob() {
        WorkOrderRepository repo = mock(WorkOrderRepository.class);
        AuthorizationService auth = mock(AuthorizationService.class);
        WorkOrder order = new WorkOrder();
        order.setId(1L);
        order.setStatus(WorkOrder.Status.COMPLETED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));
        when(auth.hasRole("TECHNICIAN")).thenReturn(false);
        when(auth.hasRole("MANAGER")).thenReturn(true);
        when(auth.hasRole("ADMIN")).thenReturn(false);
        when(auth.hasRole("DISPATCHER")).thenReturn(false);
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        WorkOrder saved = service(repo, auth).updateStatus(1L, WorkOrder.Status.CLOSED);

        assertEquals(WorkOrder.Status.CLOSED, saved.getStatus());
    }
}