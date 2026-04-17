import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskDashboardComponent } from './task-dashboard.component';
import { SharedModule } from 'app/shared/shared.module'; // JHipster's shared module

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [TaskDashboardComponent],
  exports: [TaskDashboardComponent],
})
export class TaskDashboardModule {}