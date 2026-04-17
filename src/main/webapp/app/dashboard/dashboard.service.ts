import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IDashboardStats, ITaskEvolutionData, ITaskStatusDistributionData } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/tasks');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  getDashboardStats(): Observable<IDashboardStats> {
    return this.http.get<IDashboardStats>(`${this.resourceUrl}/dashboard-stats`);
  }

  getCompletedTasksEvolution(): Observable<ITaskEvolutionData[]> {
    // Assuming an API endpoint that returns an array of { date: string, count: number }
    return this.http.get<ITaskEvolutionData[]>(`${this.resourceUrl}/completed-tasks-evolution-7-days`);
  }

  getTaskStatusDistribution(): Observable<ITaskStatusDistributionData[]> {
    // Assuming an API endpoint that returns an array of { status: string, count: number }
    return this.http.get<ITaskStatusDistributionData[]>(`${this.resourceUrl}/status-distribution`);
  }
}