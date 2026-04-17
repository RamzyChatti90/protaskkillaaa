package com.protaskkillaaa.service.dto;

import com.protaskkillaaa.domain.enumeration.TaskStatus;
import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class DashboardDataDTO implements Serializable {

    private Long totalTasks;
    private Map<TaskStatus, Long> tasksByStatus;
    private List<DailyTaskCompletionDTO> dailyCompletions;

    public DashboardDataDTO(Long totalTasks, Map<TaskStatus, Long> tasksByStatus, List<DailyTaskCompletionDTO> dailyCompletions) {
        this.totalTasks = totalTasks;
        this.tasksByStatus = tasksByStatus;
        this.dailyCompletions = dailyCompletions;
    }

    public Long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Map<TaskStatus, Long> getTasksByStatus() {
        return tasksByStatus;
    }

    public void setTasksByStatus(Map<TaskStatus, Long> tasksByStatus) {
        this.tasksByStatus = tasksByStatus;
    }

    public List<DailyTaskCompletionDTO> getDailyCompletions() {
        return dailyCompletions;
    }

    public void setDailyCompletions(List<DailyTaskCompletionDTO> dailyCompletions) {
        this.dailyCompletions = dailyCompletions;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DashboardDataDTO that = (DashboardDataDTO) o;
        return Objects.equals(totalTasks, that.totalTasks) &&
               Objects.equals(tasksByStatus, that.tasksByStatus) &&
               Objects.equals(dailyCompletions, that.dailyCompletions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(totalTasks, tasksByStatus, dailyCompletions);
    }

    @Override
    public String toString() {
        return "DashboardDataDTO{" +
               "totalTasks=" + totalTasks +
               ", tasksByStatus=" + tasksByStatus +
               ", dailyCompletions=" + dailyCompletions +
               '}';
    }
}