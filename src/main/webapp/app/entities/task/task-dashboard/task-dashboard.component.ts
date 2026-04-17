import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TaskDashboardService } from './task-dashboard.service';
import { ITaskDashboardStats, ITaskEvolutionData, ITaskStatusDistribution } from './task-dashboard.model';
import { Chart, registerables, ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'jhi-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss'],
})
export class TaskDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('evolutionChartCanvas') evolutionChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChartCanvas') statusChartCanvas!: ElementRef<HTMLCanvasElement>;

  dashboardStats: ITaskDashboardStats | null = null;
  evolutionChart: Chart<'line'> | undefined;
  statusChart: Chart<'doughnut'> | undefined;

  private destroy$ = new Subject<void>();

  constructor(protected taskDashboardService: TaskDashboardService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
    if (this.statusChart) {
      this.statusChart.destroy();
    }
  }

  loadDashboardData(): void {
    this.taskDashboardService
      .getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.dashboardStats = stats;
      });

    this.taskDashboardService
      .getCompletedTasksEvolution()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.renderEvolutionChart(data);
      });

    this.taskDashboardService
      .getTaskStatusDistribution()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.renderStatusChart(data);
      });
  }

  renderEvolutionChart(data: ITaskEvolutionData[]): void {
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }

    const labels = data.map(d => d.date);
    const counts = data.map(d => d.count);

    const chartData: ChartData<'line'> = {
      labels: labels,
      datasets: [
        {
          label: 'Tâches terminées',
          data: counts,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false,
        },
      ],
    };

    const chartOptions: ChartOptions<'line'> = {
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
      plugins: {
        title: {
          display: true,
          text: 'Évolution des tâches terminées sur les 7 derniers jours',
        },
      },
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: chartData,
      options: chartOptions,
    };

    const ctx = this.evolutionChartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.evolutionChart = new Chart(ctx, config);
    }
  }

  renderStatusChart(data: ITaskStatusDistribution): void {
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const labels = Object.keys(data).map(status => this.mapStatusToFrench(status));
    const counts = Object.values(data);

    const chartData: ChartData<'doughnut'> = {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(255, 99, 132)'], // Completed, Ongoing, Todo
          hoverOffset: 4,
        },
      ],
    };

    const chartOptions: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Répartition des tâches par statut',
        },
        legend: {
          position: 'bottom',
        },
      },
    };

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: chartData,
      options: chartOptions,
    };

    const ctx = this.statusChartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.statusChart = new Chart(ctx, config);
    }
  }

  mapStatusToFrench(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Terminées';
      case 'ONGOING':
        return 'En cours';
      case 'TODO':
        return 'À faire';
      default:
        return status;
    }
  }
}