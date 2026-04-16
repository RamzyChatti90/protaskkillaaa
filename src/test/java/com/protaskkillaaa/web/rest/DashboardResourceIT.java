package com.protaskkillaaa.web.rest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.protaskkillaaa.IntegrationTest;
import com.protaskkillaaa.domain.enumeration.TaskStatus;
import com.protaskkillaaa.service.DashboardService;
import com.protaskkillaaa.service.dto.DailyTaskCompletionDTO;
import com.protaskkillaaa.service.dto.DashboardDataDTO;
import java.time.LocalDate;
import java.util.Collections;
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

    private static final String API_DASHBOARD_URL = "/api/dashboard";

    @Autowired
    private MockMvc restDashboardMockMvc;

    @MockBean
    private DashboardService dashboardService;

    private DashboardDataDTO mockDashboardData;

    @BeforeEach
    void setUp() {
        // Prepare mock data
        Long totalTasks = 10L;
        Map<TaskStatus, Long> tasksByStatus = new HashMap<>();
        tasksByStatus.put(TaskStatus.TODO, 5L);
        tasksByStatus.put(TaskStatus.IN_PROGRESS, 3L);
        tasksByStatus.put(TaskStatus.DONE, 2L);

        List<DailyTaskCompletionDTO> dailyCompletions = List.of(new DailyTaskCompletionDTO(LocalDate.now(), 1L));

        mockDashboardData = new DashboardDataDTO(totalTasks, tasksByStatus, dailyCompletions);
    }

    @Test
    void getDashboardData_shouldReturnDashboardData() throws Exception {
        when(dashboardService.getDashboardData()).thenReturn(mockDashboardData);

        restDashboardMockMvc
            .perform(get(API_DASHBOARD_URL).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.totalTasks").value(mockDashboardData.getTotalTasks()))
            .andExpect(jsonPath("$.tasksByStatus.TODO").value(mockDashboardData.getTasksByStatus().get(TaskStatus.TODO)))
            .andExpect(jsonPath("$.tasksByStatus.IN_PROGRESS").value(mockDashboardData.getTasksByStatus().get(TaskStatus.IN_PROGRESS)))
            .andExpect(jsonPath("$.tasksByStatus.DONE").value(mockDashboardData.getTasksByStatus().get(TaskStatus.DONE)))
            .andExpect(jsonPath("$.dailyCompletions[0].date").exists())
            .andExpect(jsonPath("$.dailyCompletions[0].completedTasks").value(1L));
    }
}
