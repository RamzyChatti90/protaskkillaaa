import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { ITaskDashboardStats, ITaskEvolutionData, ITaskStatusDistribution } from './task-dashboard.model';

@Injectable({ providedIn: 'root' })
export class TaskDashboardService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/tasks');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  getDashboardStats(): Observable<ITaskDashboardStats> {
    return this.http.get<ITaskDashboardStats>(`${this.resourceUrl}/dashboard-stats`);
  }

  getCompletedTasksEvolution(): Observable<ITaskEvolutionData[]> {
    return this.http.get<ITaskEvolutionData[]>(`${this.resourceUrl}/completed-evolution`);
  }

  getTaskStatusDistribution(): Observable<ITaskStatusDistribution> {
    return this.http.get<ITaskStatusDistribution>(`${this.resourceUrl}/status-distribution`);
  }
}