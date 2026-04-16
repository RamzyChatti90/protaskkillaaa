package com.protaskkillaaa.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.protaskkillaaa.domain.enumeration.TaskStatus;
import com.protaskkillaaa.repository.TaskRepository;
import com.protaskkillaaa.security.SecurityUtils;
import com.protaskkillaaa.service.dto.DailyTaskCompletionDTO;
import com.protaskkillaaa.service.dto.DashboardDataDTO;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private String currentUserLogin;

    @BeforeEach
    void setUp() {
        currentUserLogin = "testuser";
    }

    @Test
    void getDashboardData_shouldReturnCorrectData() {
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getCurrentUserLogin).thenReturn(Optional.of(currentUserLogin));

            // Mocking total tasks
            when(taskRepository.countByAssignedTo_Login(currentUserLogin)).thenReturn(10L);

            // Mocking tasks by status
            when(taskRepository.countByStatusAndAssignedTo_Login(TaskStatus.TODO, currentUserLogin)).thenReturn(5L);
            when(taskRepository.countByStatusAndAssignedTo_Login(TaskStatus.IN_PROGRESS, currentUserLogin)).thenReturn(3L);
            when(taskRepository.countByStatusAndAssignedTo_Login(TaskStatus.DONE, currentUserLogin)).thenReturn(2L);

            // Mocking daily task completions
            LocalDate today = LocalDate.now();
            when(
                taskRepository.countByStatusAndCreatedAtBetweenAndAssignedTo_Login(
                    eq(TaskStatus.DONE),
                    any(Instant.class),
                    any(Instant.class),
                    eq(currentUserLogin)
                )
            )
                .thenAnswer(invocation -> {
                    Instant start = invocation.getArgument(1);
                    Instant end = invocation.getArgument(2);
                    LocalDate date = LocalDate.ofInstant(start, ZoneId.systemDefault());
                    if (date.isEqual(today.minusDays(0))) return 1L;
                    if (date.isEqual(today.minusDays(1))) return 0L;
                    if (date.isEqual(today.minusDays(2))) return 1L;
                    if (date.isEqual(today.minusDays(3))) return 0L;
                    if (date.isEqual(today.minusDays(4))) return 1L;
                    if (date.isEqual(today.minusDays(5))) return 0L;
                    if (date.isEqual(today.minusDays(6))) return 1L;
                    return 0L;
                });

            DashboardDataDTO result = dashboardService.getDashboardData();

            // Assertions
            assertThat(result).isNotNull();
            assertThat(result.getTotalTasks()).isEqualTo(10L);

            Map<TaskStatus, Long> expectedTasksByStatus = new HashMap<>();
            expectedTasksByStatus.put(TaskStatus.TODO, 5L);
            expectedTasksByStatus.put(TaskStatus.IN_PROGRESS, 3L);
            expectedTasksByStatus.put(TaskStatus.DONE, 2L);
            assertThat(result.getTasksByStatus()).isEqualTo(expectedTasksByStatus);

            assertThat(result.getDailyCompletions()).hasSize(7);
            assertThat(
                result
                    .getDailyCompletions()
                    .stream()
                    .filter(dto -> dto.getDate().isEqual(today))
                    .findFirst()
                    .map(DailyTaskCompletionDTO::getCompletedTasks)
                    .orElse(0L)
            )
                .isEqualTo(1L); // Today

            verify(taskRepository, times(1)).countByAssignedTo_Login(currentUserLogin);
            verify(taskRepository, times(TaskStatus.values().length)).countByStatusAndAssignedTo_Login(any(TaskStatus.class), eq(currentUserLogin));
            verify(taskRepository, times(7)).countByStatusAndCreatedAtBetweenAndAssignedTo_Login(
                eq(TaskStatus.DONE),
                any(Instant.class),
                any(Instant.class),
                eq(currentUserLogin)
            );
        }
    }
}
