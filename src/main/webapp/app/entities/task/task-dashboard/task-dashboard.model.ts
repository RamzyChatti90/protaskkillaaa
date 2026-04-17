export interface ITaskDashboardStats {
  total: number;
  completed: number;
  ongoing: number;
  todo: number;
}

export interface ITaskEvolutionData {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ITaskStatusDistribution {
  [key: string]: number; // e.g., { COMPLETED: 60, ONGOING: 30, TODO: 10 }
}