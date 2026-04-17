import { DailyTaskCompletion } from './daily-task-completion.model';

export interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  tasksByStatus: { status: string; count: number }[];
  dailyTaskCompletion: DailyTaskCompletion[];
}
