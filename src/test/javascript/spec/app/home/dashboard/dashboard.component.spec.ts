import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import { Chart } from 'chart.js';

import DashboardComponent from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: DashboardService;
  let mockDashboardData: DashboardData;

  beforeEach(async () => {
    mockDashboardData = {
      totalTasks: 10,
      completedTasks: 5,
      inProgressTasks: 3,
      dailyCompletions: [
        { date: '2023-01-01', completedTasks: 1 },
        { date: '2023-01-02', completedTasks: 2 },
      ],
    };

    const dashboardServiceStub = {
      getDashboardData: () => of(mockDashboardData),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [{ provide: DashboardService, useValue: dashboardServiceStub }],
    })
      .overrideComponent(DashboardComponent, {
        set: {
          imports: [], // Clear imports for isolated testing
          providers: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService);

    // Mock Chart.js constructor and destroy method
    spyOn(Chart, 'constructor' as any).and.returnValue({
      destroy: jasmine.createSpy('destroy'),
    });
    spyOn(Chart.prototype, 'destroy').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    spyOn(dashboardService, 'getDashboardData').and.returnValue(of(mockDashboardData));
    component.ngOnInit();
    expect(dashboardService.getDashboardData).toHaveBeenCalled();
    expect(component.dashboardData()).toEqual(mockDashboardData);
  });

  it('should call updateCharts on init if data is present', () => {
    spyOn(component, 'updateCharts');
    component.ngOnInit();
    expect(component.updateCharts).toHaveBeenCalled();
  });

  it('should create daily completion chart', () => {
    // Manually set dashboardData and call the chart creation method
    component.dashboardData.set(mockDashboardData);
    component.dailyCompletionCanvas = { nativeElement: { getContext: () => ({}) } } as ElementRef<HTMLCanvasElement>;
    component.createDailyCompletionChart();
    expect(Chart).toHaveBeenCalledWith(jasmine.any(Object), jasmine.objectContaining({ type: 'line' }));
  });

  it('should create task status chart', () => {
    // Manually set dashboardData and call the chart creation method
    component.dashboardData.set(mockDashboardData);
    component.taskStatusCanvas = { nativeElement: { getContext: () => ({}) } } as ElementRef<HTMLCanvasElement>;
    component.createTaskStatusChart();
    expect(Chart).toHaveBeenCalledWith(jasmine.any(Object), jasmine.objectContaining({ type: 'pie' }));
  });

  it('should destroy charts on destroy', () => {
    component.dailyCompletionChart = new Chart('dailyCompletionCanvas', {});
    component.taskStatusChart = new Chart('taskStatusCanvas', {});

    component.ngOnDestroy();

    expect(component.dailyCompletionChart.destroy).toHaveBeenCalled();
    expect(component.taskStatusChart.destroy).toHaveBeenCalled();
  });
});
