import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';

import { CommonModule } from '@angular/common';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { DashboardService } from './dashboard.service';
import { IDashboardStats } from './dashboard.model';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  dashboardStats: IDashboardStats | null = null;
  isLoading = false;

  @ViewChild('lineChart') lineChartRef!: ElementRef;
  @ViewChild('pieChart') pieChartRef!: ElementRef;

  lineChart: Chart | undefined;
  pieChart: Chart | undefined;

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
  constructor(protected dashboardService: DashboardService, private faLibrary: FaIconLibrary) {
    Chart.register(...registerables);
    this.faLibrary.addIcons(faSync);
  }
  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: this.lineChartData,
      options: this.lineChartOptions,
    });

    this.pieChart = new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: this.pieChartData,
      options: this.pieChartOptions,
    });
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
          if (this.lineChart) {
            this.lineChart.data.labels = evolution.map(item => item.date);
            if (this.lineChart.data.datasets[0]) {
              this.lineChart.data.datasets[0].data = evolution.map(item => item.count);
            }
            this.lineChart.update();
          }

          // Update Pie Chart Data
          const completed = distribution.find(item => item.status === 'COMPLETED')?.count || 0;
          const inProgress = distribution.find(item => item.status === 'IN_PROGRESS')?.count || 0;
          const todo = distribution.find(item => item.status === 'TODO')?.count || 0;
          if (this.pieChart) {
            if (this.pieChart.data.datasets[0]) {
              this.pieChart.data.datasets[0].data = [completed, inProgress, todo];
            }
            this.pieChart.update();
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
    this.lineChart?.destroy();
    this.pieChart?.destroy();
  }
}