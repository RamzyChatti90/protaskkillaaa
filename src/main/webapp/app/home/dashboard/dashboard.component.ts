import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Chart from 'chart.js/auto';

import SharedModule from 'app/shared/shared.module';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.model';
import { DailyTaskCompletion } from './daily-task-completion.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData = signal<DashboardData | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  private readonly destroy$ = new Subject<void>();
  private readonly dashboardService = inject(DashboardService);

  dailyCompletionChart: Chart | null = null;
  tasksByStatusChart: Chart | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dashboardService
      .getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.dashboardData.set(data);
          this.isLoading.set(false);
          this.renderCharts();
        },
        error: error => {
          this.errorMessage.set('Erreur lors du chargement des données du tableau de bord.');
          this.isLoading.set(false);
          console.error('Error loading dashboard data', error);
        },
      });
  }

  renderCharts(): void {
    const data = this.dashboardData();
    if (!data) {
      return;
    }

    // Daily Task Completion Chart (Line Chart)
    if (this.dailyCompletionChart) {
      this.dailyCompletionChart.destroy();
    }
    const dailyCompletionCanvas = document.getElementById('dailyCompletionChart') as HTMLCanvasElement;
    if (dailyCompletionCanvas) {
      this.dailyCompletionChart = new Chart(dailyCompletionCanvas, {
        type: 'line',
        data: {
          labels: data.dailyTaskCompletion.map((item: DailyTaskCompletion) => item.date),
          datasets: [
            {
              label: 'Tâches Terminées',
              data: data.dailyTaskCompletion.map((item: DailyTaskCompletion) => item.completedTasks),
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
                text: 'Nombre de tâches terminées',
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

    // Tasks by Status Chart (Doughnut Chart)
    if (this.tasksByStatusChart) {
      this.tasksByStatusChart.destroy();
    }
    const tasksByStatusCanvas = document.getElementById('tasksByStatusChart') as HTMLCanvasElement;
    if (tasksByStatusCanvas) {
      this.tasksByStatusChart = new Chart(tasksByStatusCanvas, {
        type: 'doughnut',
        data: {
          labels: data.tasksByStatus.map(item => item.status),
          datasets: [
            {
              data: data.tasksByStatus.map(item => item.count),
              backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#F44336'], // Exemple de couleurs
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dailyCompletionChart) {
      this.dailyCompletionChart.destroy();
    }
    if (this.tasksByStatusChart) {
      this.tasksByStatusChart.destroy();
    }
  }
}
