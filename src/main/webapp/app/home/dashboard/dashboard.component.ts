import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.model';
import { CommonModule, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('dailyCompletionCanvas') dailyCompletionCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('taskStatusCanvas') taskStatusCanvas?: ElementRef<HTMLCanvasElement>;

  dashboardData = signal<DashboardData | null>(null);
  dailyCompletionChart: Chart | null = null;
  taskStatusChart: Chart | null = null;

  constructor(private dashboardService: DashboardService, private translateService: TranslateService) {}
  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe(data => {
      this.dashboardData.set(data);
      this.updateCharts();
    });
  }

  ngOnDestroy(): void {
    if (this.dailyCompletionChart) {
      this.dailyCompletionChart.destroy();
    }
    if (this.taskStatusChart) {
      this.taskStatusChart.destroy();
    }
  }

  updateCharts(): void {
    if (this.dashboardData()) {
      this.createDailyCompletionChart();
      this.createTaskStatusChart();
    }
  }

  createDailyCompletionChart(): void {
    if (this.dailyCompletionCanvas?.nativeElement && this.dashboardData()) {
      const ctx = this.dailyCompletionCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const labels = this.dashboardData()!.dailyCompletions.map(d => d.date);
        const data = this.dashboardData()!.dailyCompletions.map(d => d.completedTasks);

        if (this.dailyCompletionChart) {
          this.dailyCompletionChart.destroy();
        }

        this.dailyCompletionChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: this.translateService.instant('home.dashboard.dailyCompletionChart.label'),
                data: data,
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
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        });
      }
    }
  }

  createTaskStatusChart(): void {
    if (this.taskStatusCanvas?.nativeElement && this.dashboardData()) {
      const ctx = this.taskStatusCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const data = [
          this.dashboardData()!.completedTasks,
          this.dashboardData()!.inProgressTasks,
          this.dashboardData()!.totalTasks - this.dashboardData()!.completedTasks - this.dashboardData()!.inProgressTasks,
        ];
        const labels = [
          this.translateService.instant('home.dashboard.taskStatusChart.completed'),
          this.translateService.instant('home.dashboard.taskStatusChart.inProgress'),
          this.translateService.instant('home.dashboard.taskStatusChart.todo'),
        ];

        if (this.taskStatusChart) {
          this.taskStatusChart.destroy();
        }

        this.taskStatusChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
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
}
