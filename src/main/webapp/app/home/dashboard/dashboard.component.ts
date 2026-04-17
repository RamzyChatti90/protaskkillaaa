import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';

import SharedModule from 'app/shared/shared.module';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.model';
import { TaskStatus } from 'app/entities/enumerations/task-status.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard', // Changed from 'jhi-dashboard' to 'app-dashboard' as per diagnostic
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData = signal<DashboardData | null>(null);
  private readonly destroy$ = new Subject<void>();

  private dashboardService = inject(DashboardService);

  dailyCompletionChart: Chart | undefined;
  taskStatusChart: Chart | undefined;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService
      .getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dashboardData.set(data);
        this.createDailyCompletionChart(data);
        this.createTaskStatusChart(data);
      });
  }

  createDailyCompletionChart(data: DashboardData): void {
    const labels = data.dailyCompletions.map(d => d.date);
    const completedTasks = data.dailyCompletions.map(d => d.completedTasks);

    if (this.dailyCompletionChart) {
      this.dailyCompletionChart.destroy();
    }

    this.dailyCompletionChart = new Chart('dailyCompletionCanvas', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tâches terminées',
            data: completedTasks,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Nombre de tâches',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
        },
      },
    });
  }

  createTaskStatusChart(data: DashboardData): void {
    const total = data.totalTasks;
    const completed = data.completedTasks;
    const inProgress = data.inProgressTasks;
    const todo = total - completed - inProgress; // Assuming 'TODO' are the remaining tasks

    if (this.taskStatusChart) {
      this.taskStatusChart.destroy();
    }

    this.taskStatusChart = new Chart('taskStatusCanvas', {
      type: 'pie',
      data: {
        labels: ['Terminées', 'En cours', 'À faire'],
        datasets: [
          {
            data: [completed, inProgress, todo],
            backgroundColor: ['#4CAF50', '#FFC107', '#2196F3'],
            hoverBackgroundColor: ['#66BB6A', '#FFD54F', '#42A5F5'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dailyCompletionChart) {
      this.dailyCompletionChart.destroy();
    }
    if (this.taskStatusChart) {
      this.taskStatusChart.destroy();
    }
  }
}