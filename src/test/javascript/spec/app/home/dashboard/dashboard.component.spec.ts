import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.model';

describe('DashboardComponent', () => {
  let comp: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let service: DashboardService;

  const mockDashboardData: DashboardData = {
    totalTasks: 10,
    completedTasks: 5,
    inProgressTasks: 3,
    dailyCompletions: [
      { date: '2023-01-01', completedTasks: 1 },
      { date: '2023-01-02', completedTasks: 2 },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [DashboardService],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(DashboardService);
  });

  it('should load dashboard data on init', () => {
    jest.spyOn(service, 'getDashboardData').mockReturnValue(of(mockDashboardData));
    comp.ngOnInit();
    expect(comp.dashboardData()).toEqual(mockDashboardData);
  });

  it('should destroy charts on destroy', () => {
    comp.dailyCompletionChart = { destroy: jest.fn() } as any;
    comp.taskStatusChart = { destroy: jest.fn() } as any;

    comp.ngOnDestroy();

    expect(comp.dailyCompletionChart?.destroy).toHaveBeenCalled();
    expect(comp.taskStatusChart?.destroy).toHaveBeenCalled();
  });

  it('should create daily completion chart', () => {
    comp.dashboardData.set(mockDashboardData);
    comp.dailyCompletionCanvas = { nativeElement: { getContext: () => ({}) } } as ElementRef<HTMLCanvasElement>;
    comp.createDailyCompletionChart();
    expect(comp.dailyCompletionChart).not.toBeNull();
    expect(comp.dailyCompletionChart?.data.labels).toEqual(['2023-01-01', '2023-01-02']);
    expect(comp.dailyCompletionChart?.data.datasets[0].data).toEqual([1, 2]);
  });

  it('should create task status chart', () => {
    comp.dashboardData.set(mockDashboardData);
    comp.taskStatusCanvas = { nativeElement: { getContext: () => ({}) } } as ElementRef<HTMLCanvasElement>;
    comp.createTaskStatusChart();
    expect(comp.taskStatusChart).not.toBeNull();
    expect(comp.taskStatusChart?.data.labels).toEqual(['Completed', 'In Progress', 'To Do']);
    expect(comp.taskStatusChart?.data.datasets[0].data).toEqual([5, 3, 2]); // 10 - 5 - 3 = 2
  });
});
