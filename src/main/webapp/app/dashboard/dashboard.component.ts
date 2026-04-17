import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

import { DashboardService } from './dashboard.service';
import { IDashboardStats } from './dashboard.model';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardStats: IDashboardStats | null = null;
  isLoading = false;

  // Line Chart for Completed Tasks Evolution
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Tâches Terminées',
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75,192,192,0.4)',
        fill: true,
        tension: 0.3,
      },
    ],
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Évolution des tâches terminées (7 derniers jours)',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Nombre de tâches',
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  public lineChartType: ChartType = 'line';

  // Pie Chart for Task Status Distribution
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Terminées', 'En cours', 'À faire'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3'],
        hoverBackgroundColor: ['#66BB6A', '#FFCA28', '#42A5F5'],
      },
    ],
  };
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Répartition des tâches par statut',
      },
      legend: {
        position: 'top',
      },
    },
  };
  public pieChartType: ChartType = 'pie';

  protected destroy$ = new Subject<void>();

  constructor(protected dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    combineLatest([
      this.dashboardService.getDashboardStats(),
      this.dashboardService.getCompletedTasksEvolution(),
      this.dashboardService.getTaskStatusDistribution(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ([stats, evolution, distribution]) => {
          this.dashboardStats = stats;

          // Update Line Chart Data
          this.lineChartData.labels = evolution.map(item => item.date);
          if (this.lineChartData.datasets[0]) {
            this.lineChartData.datasets[0].data = evolution.map(item => item.count);
          }

          // Update Pie Chart Data
          const completed = distribution.find(item => item.status === 'COMPLETED')?.count || 0;
          const inProgress = distribution.find(item => item.status === 'IN_PROGRESS')?.count || 0;
          const todo = distribution.find(item => item.status === 'TODO')?.count || 0;
          if (this.pieChartData.datasets[0]) {
            this.pieChartData.datasets[0].data = [completed, inProgress, todo];
          }

          this.isLoading = false;
        },
        error => {
          console.error('Error loading dashboard data', error);
          this.isLoading = false;
        }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}