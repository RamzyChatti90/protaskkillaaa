export interface IDashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

export interface ITaskEvolutionData {
  date: string;
  count: number;
}

export interface ITaskStatusDistributionData {
  status: string;
  count: number;
}