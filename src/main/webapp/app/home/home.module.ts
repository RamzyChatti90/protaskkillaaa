import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart'; // Import ChartModule for ng2-charts if using PrimeNG, or directly Chart.js
import { NgChartsModule } from 'ng2-charts'; // Import NgChartsModule for Chart.js integration

import { ProtaskkillaaaSharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
import { DashboardComponent } from '../dashboard/dashboard.component'; // Import the new DashboardComponent

@NgModule({
  imports: [ProtaskkillaaaSharedModule, RouterModule.forChild([HOME_ROUTE]), NgChartsModule],
  declarations: [HomeComponent, DashboardComponent], // Declare DashboardComponent
  // If DashboardComponent needs to be used outside of this module's components,
  // it would need to be exported here as well. For this ticket, it's used within HomeComponent.
})
export class ProtaskkillaaaHomeModule {}