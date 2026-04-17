import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { DashboardData } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/dashboard');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.resourceUrl);
  }
}
