// src/main/webapp/app/home/dashboard/dashboard.model.ts

export interface DailyTaskCompletion {
  date: string;
  completedTasks: number;
}

export interface DashboardData {
  dailyCompletions: DailyTaskCompletion[];
  completedTasks: number;
  inProgressTasks: number;
  totalTasks: number;
}