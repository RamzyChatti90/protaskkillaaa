package com.protaskkillaaa.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import com.protaskkillaaa.domain.enumeration.TaskStatus;
import com.protaskkillaaa.repository.TaskRepository;
import com.protaskkillaaa.security.SecurityUtils;
import com.protaskkillaaa.service.dto.DailyTaskCompletionDTO;
import com.protaskkillaaa.service.dto.DashboardDataDTO;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Arrays;
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

    private final String TEST_LOGIN = "testuser";

    @BeforeEach
    void setUp() {
        // Mock SecurityUtils.getCurrentUserLogin() for each test
        // This is done in individual tests or setup if it's a static method
    }

    @Test
    void getDashboardData_shouldReturnCorrectData() {
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getCurrentUserLogin).thenReturn(Optional.of(TEST_LOGIN));

            // Mock total tasks
            when(taskRepository.countByAssignedTo_Login(TEST_LOGIN)).thenReturn(10L);

            // Mock tasks by status
            when(taskRepository.countByStatusAndAssignedTo_Login(TaskStatus.TODO, TEST_LOGIN)).thenReturn(3L);
            when(taskRepository.countByStatusAndAssignedTo_Login(TaskStatus.IN_PROGRESS, TEST_LOGIN)).thenReturn(5L);
            when(taskRepository.countByStatusAndAssignedTo_Login(TaskStatus.DONE, TEST_LOGIN)).thenReturn(2L);
            when(taskRepository.countByStatusAndAssignedTo_Login(TaskStatus.CANCELLED, TEST_LOGIN)).thenReturn(0L);

            // Mock daily completions for the last 7 days
            LocalDate today = LocalDate.now();
            for (int i = 0; i < 7; i++) {
                LocalDate date = today.minusDays(6 - i);
                Instant startOfDay = date.atStartOfDay(ZoneOffset.UTC).toInstant();
                Instant endOfDay = date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
                when(
                    taskRepository.countByStatusAndCreatedAtBetweenAndAssignedTo_Login(
                        eq(TaskStatus.DONE),
                        eq(startOfDay),
                        eq(endOfDay),
                        eq(TEST_LOGIN)
                    )
                )
                    .thenReturn((long) i); // Simulate 0, 1, 2, 3, 4, 5, 6 completed tasks
            }

            DashboardDataDTO result = dashboardService.getDashboardData();

            assertThat(result).isNotNull();
            assertThat(result.getTotalTasks()).isEqualTo(10L);

            Map<TaskStatus, Long> tasksByStatus = result.getTasksByStatus();
            assertThat(tasksByStatus).isNotNull().hasSize(4);
            assertThat(tasksByStatus.get(TaskStatus.TODO)).isEqualTo(3L);
            assertThat(tasksByStatus.get(TaskStatus.IN_PROGRESS)).isEqualTo(5L);
            assertThat(tasksByStatus.get(TaskStatus.DONE)).isEqualTo(2L);
            assertThat(tasksByStatus.get(TaskStatus.CANCELLED)).isEqualTo(0L);

            List<DailyTaskCompletionDTO> dailyCompletions = result.getDailyCompletions();
            assertThat(dailyCompletions).isNotNull().hasSize(7);
            for (int i = 0; i < 7; i++) {
                assertThat(dailyCompletions.get(i).getDate()).isEqualTo(today.minusDays(6 - i));
                assertThat(dailyCompletions.get(i).getCompletedTasks()).isEqualTo((long) i);
            }
        }
    }

    @Test
    void getDashboardData_shouldHandleNoUserLogin() {
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getCurrentUserLogin).thenReturn(Optional.empty());

            org.assertj.core.api.Assertions.assertThatThrownBy(() -> dashboardService.getDashboardData())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Current user login not found");
        }
    }
}
