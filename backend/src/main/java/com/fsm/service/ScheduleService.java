package com.fsm.service;

import com.fsm.entity.Schedule;
import com.fsm.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }


    // Get all schedules
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }


    // Get schedule by ID
    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }


    // Create schedule
    public Schedule createSchedule(Schedule schedule) {

        if (schedule.getStatus() == null) {
            schedule.setStatus(Schedule.Status.SCHEDULED);
        }

        return scheduleRepository.save(schedule);
    }


    // Update schedule
    public Schedule updateSchedule(Long id, Schedule updatedSchedule) {

        Schedule existingSchedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + id));

        existingSchedule.setWorkOrderId(updatedSchedule.getWorkOrderId());
        existingSchedule.setTechnicianId(updatedSchedule.getTechnicianId());
        existingSchedule.setScheduledDate(updatedSchedule.getScheduledDate());
        existingSchedule.setStartTime(updatedSchedule.getStartTime());
        existingSchedule.setEndTime(updatedSchedule.getEndTime());
        existingSchedule.setStatus(updatedSchedule.getStatus());
        existingSchedule.setNotes(updatedSchedule.getNotes());

        return scheduleRepository.save(existingSchedule);
    }


    // Delete schedule
    public void deleteSchedule(Long id) {

        if (!scheduleRepository.existsById(id)) {
            throw new RuntimeException("Schedule not found with id: " + id);
        }

        scheduleRepository.deleteById(id);
    }


    // Get schedules by technician
    public List<Schedule> getSchedulesByTechnician(Long technicianId) {
        return scheduleRepository.findByTechnicianId(technicianId);
    }


    // Get schedules by work order
    public List<Schedule> getSchedulesByWorkOrder(Long workOrderId) {
        return scheduleRepository.findByWorkOrderId(workOrderId);
    }


    // Get schedules by date
    public List<Schedule> getSchedulesByDate(LocalDate date) {
        return scheduleRepository.findByScheduledDate(date);
    }


    // Get schedules by status
    public List<Schedule> getSchedulesByStatus(Schedule.Status status) {
        return scheduleRepository.findByStatus(status);
    }
}