package com.protaskkillaaa.service;

import com.protaskkillaaa.domain.enumeration.TaskStatus;
import com.protaskkillaaa.repository.TaskRepository;
import com.protaskkillaaa.security.SecurityUtils;
import com.protaskkillaaa.service.dto.DailyTaskCompletionDTO;
import com.protaskkillaaa.service.dto.DashboardDataDTO;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DashboardService {

    private final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final TaskRepository taskRepository;

    public DashboardService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public DashboardDataDTO getDashboardData() {
        String userLogin = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new IllegalStateException("Current user login not found"));

        // Total tasks
        Long totalTasks = taskRepository.countByAssignedTo_Login(userLogin);

        // Tasks by status
        Map<TaskStatus, Long> tasksByStatus = new EnumMap<>(TaskStatus.class);
        for (TaskStatus status : TaskStatus.values()) {
            tasksByStatus.put(status, taskRepository.countByStatusAndAssignedTo_Login(status, userLogin));
        }

        // Daily task completions for the last 7 days
        List<DailyTaskCompletionDTO> dailyCompletions = Stream
            .iterate(LocalDate.now().minusDays(6), date -> date.plusDays(1))
            .limit(7)
            .map(date -> {
                Instant startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant endOfDay = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
                Long completedTasks = taskRepository.countByStatusAndCreatedAtBetweenAndAssignedTo_Login(
                    TaskStatus.DONE,
                    startOfDay,
                    endOfDay,
                    userLogin
                );
                return new DailyTaskCompletionDTO(date, completedTasks);
            })
            .sorted(Comparator.comparing(DailyTaskCompletionDTO::getDate))
            .collect(Collectors.toList());

        return new DashboardDataDTO(totalTasks, tasksByStatus, dailyCompletions);
    }
}
