export interface DailyTaskCompletion {
  date: string;
  completedTasks: number;
}

export interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  dailyCompletions: DailyTaskCompletion[];
}
