import { Component, OnInit, OnDestroy, inject, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'jhi-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  dashboardData = signal<DashboardData | null>(null);

  @ViewChild('dailyCompletionCanvas') dailyCompletionCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('taskStatusCanvas') taskStatusCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly destroy$ = new Subject<void>();
  private readonly dashboardService = inject(DashboardService);

  dailyCompletionChart: Chart | null = null;
  taskStatusChart: Chart | null = null;

  ngOnInit(): void {
    this.dashboardService
      .getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dashboardData.set(data);
        this.updateCharts();
      });
  }

  ngAfterViewInit(): void {
    if (this.dashboardData()) {
      this.updateCharts();
    }
  }

  updateCharts(): void {
    this.createDailyCompletionChart();
    this.createTaskStatusChart();
  }

  createDailyCompletionChart(): void {
    if (this.dailyCompletionChart) {
      this.dailyCompletionChart.destroy();
    }
    const data = this.dashboardData();
    if (data && this.dailyCompletionCanvas) {
      const ctx = this.dailyCompletionCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const labels = data.dailyCompletions.map(d => d.date);
        const completedTasks = data.dailyCompletions.map(d => d.completedTasks);

        this.dailyCompletionChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Tâches Terminées',
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
              },
            },
          },
        });
      }
    }
  }

  createTaskStatusChart(): void {
    if (this.taskStatusChart) {
      this.taskStatusChart.destroy();
    }
    const data = this.dashboardData();
    if (data && this.taskStatusCanvas) {
      const ctx = this.taskStatusCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.taskStatusChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Terminées', 'En cours', 'À faire'],
            datasets: [
              {
                data: [data.completedTasks, data.inProgressTasks, data.totalTasks - data.completedTasks - data.inProgressTasks],
                backgroundColor: ['#28a745', '#ffc107', '#007bff'],
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      }
    }
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