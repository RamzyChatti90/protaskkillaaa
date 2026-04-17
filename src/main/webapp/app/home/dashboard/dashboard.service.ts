export interface DailyTaskCompletion {
  date: string;
  completedTasks: number;
}

export interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  dailyTaskCompletion: DailyTaskCompletion[];
  // Ajoutez d'autres métriques si nécessaire
}