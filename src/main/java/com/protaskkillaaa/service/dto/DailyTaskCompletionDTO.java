package com.protaskkillaaa.service.dto;

import java.time.LocalDate;
import java.io.Serializable;
import java.util.Objects;

public class DailyTaskCompletionDTO implements Serializable {

    private LocalDate date;
    private Long completedTasks;

    public DailyTaskCompletionDTO(LocalDate date, Long completedTasks) {
        this.date = date;
        this.completedTasks = completedTasks;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Long completedTasks) {
        this.completedTasks = completedTasks;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DailyTaskCompletionDTO that = (DailyTaskCompletionDTO) o;
        return Objects.equals(date, that.date) && Objects.equals(completedTasks, that.completedTasks);
    }

    @Override
    public int hashCode() {
        return Objects.hash(date, completedTasks);
    }

    @Override
    public String toString() {
        return "DailyTaskCompletionDTO{" +
               "date=" + date +
               ", completedTasks=" + completedTasks +
               '}';
    }
}