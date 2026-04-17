package com.protaskkillaaa.web.rest;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.protaskkillaaa.IntegrationTest;
import com.protaskkillaaa.domain.enumeration.TaskStatus;
import com.protaskkillaaa.service.DashboardService;
import com.protaskkillaaa.service.dto.DailyTaskCompletionDTO;
import com.protaskkillaaa.service.dto.DashboardDataDTO;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration tests for the {@link DashboardResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DashboardResourceIT {

    private static final String DEFAULT_LOGIN = "user";

    @Autowired
    private MockMvc restDashboardMockMvc;

    @MockBean
    private DashboardService dashboardService;

    private DashboardDataDTO expectedDashboardData;

    @BeforeEach
    void setup() {
        // Setup mock data for DashboardService
        Long totalTasks = 10L;

        Map<TaskStatus, Long> tasksByStatus = new HashMap<>();
        tasksByStatus.put(TaskStatus.TODO, 3L);
        tasksByStatus.put(TaskStatus.IN_PROGRESS, 5L);
        tasksByStatus.put(TaskStatus.DONE, 2L);
        tasksByStatus.put(TaskStatus.CANCELLED, 0L);

        List<DailyTaskCompletionDTO> dailyCompletions = Arrays.asList(
            new DailyTaskCompletionDTO(LocalDate.now().minusDays(1), 1L),
            new DailyTaskCompletionDTO(LocalDate.now(), 2L)
        );

        expectedDashboardData = new DashboardDataDTO(totalTasks, tasksByStatus, dailyCompletions);
    }

    @Test
    void getDashboardData() throws Exception {
        when(dashboardService.getDashboardData()).thenReturn(expectedDashboardData);

        restDashboardMockMvc
            .perform(get("/api/dashboard").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.totalTasks").value(expectedDashboardData.getTotalTasks()))
            .andExpect(jsonPath("$.tasksByStatus.TODO").value(expectedDashboardData.getTasksByStatus().get(TaskStatus.TODO)))
            .andExpect(jsonPath("$.tasksByStatus.IN_PROGRESS").value(expectedDashboardData.getTasksByStatus().get(TaskStatus.IN_PROGRESS)))
            .andExpect(jsonPath("$.tasksByStatus.DONE").value(expectedDashboardData.getTasksByStatus().get(TaskStatus.DONE)))
            .andExpect(jsonPath("$.tasksByStatus.CANCELLED").value(expectedDashboardData.getTasksByStatus().get(TaskStatus.CANCELLED)))
            .andExpect(jsonPath("$.dailyCompletions.[0].date").value(expectedDashboardData.getDailyCompletions().get(0).getDate().toString()))
            .andExpect(jsonPath("$.dailyCompletions.[0].completedTasks").value(expectedDashboardData.getDailyCompletions().get(0).getCompletedTasks()))
            .andExpect(jsonPath("$.dailyCompletions.[1].date").value(expectedDashboardData.getDailyCompletions().get(1).getDate().toString()))
            .andExpect(jsonPath("$.dailyCompletions.[1].completedTasks").value(expectedDashboardData.getDailyCompletions().get(1).getCompletedTasks()));
    }
}
