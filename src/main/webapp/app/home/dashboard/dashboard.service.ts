import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { DashboardData } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly http = inject(HttpClient);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/dashboard');

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.resourceUrl);
  }
}
