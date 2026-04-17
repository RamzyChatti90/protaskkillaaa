import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([HOME_ROUTE]), DashboardComponent],
  declarations: [HomeComponent],
})

@NgModule({
  imports: [SharedModule, RouterModule.forChild([HOME_ROUTE])],
  declarations: [HomeComponent],
})
export class ProtaskkillaaaHomeModule {}
