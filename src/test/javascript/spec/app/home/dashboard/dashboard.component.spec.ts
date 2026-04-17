
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { DashboardComponent } from 'app/home/dashboard/dashboard.component';
import { DashboardService } from 'app/home/dashboard/dashboard.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardData } from 'app/home/dashboard/dashboard.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: DashboardService;
  let translateService: TranslateService;

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
    const dashboardServiceMock = {
      getDashboardData: jest.fn(() => of(mockDashboardData)),
    };

    const translateServiceMock = {
      instant: jest.fn(key => key), // Mock instant to return the key itself
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    fixture.detectChanges(); // Calls ngOnInit
    expect(dashboardService.getDashboardData).toHaveBeenCalled();
    expect(component.dashboardData()).toEqual(mockDashboardData);
  });

  it('should initialize charts with data', () => {
    fixture.detectChanges(); // Calls ngOnInit and updateCharts
    // Since Chart.js involves DOM manipulation, we'll check if the methods were called
    // and if the chart objects are instantiated.
    // We can't directly assert Chart.js rendering without a more complex setup (e.g., JSDOM or actual browser).
    // For unit tests, checking the logic that *prepares* the charts is sufficient.
    expect(component.dailyCompletionChart).not.toBeNull();
    expect(component.taskStatusChart).not.toBeNull();
  });

  it('should destroy charts on destroy', () => {
    fixture.detectChanges(); // Create charts
    const dailyCompletionChartDestroySpy = jest.spyOn(component.dailyCompletionChart!, 'destroy');
    const taskStatusChartDestroySpy = jest.spyOn(component.taskStatusChart!, 'destroy');

    component.ngOnDestroy();

    expect(dailyCompletionChartDestroySpy).toHaveBeenCalled();
    expect(taskStatusChartDestroySpy).toHaveBeenCalled();
  });

  it('should translate chart labels', () => {
    fixture.detectChanges(); // Calls ngOnInit and updateCharts
    expect(translateService.instant).toHaveBeenCalledWith('home.dashboard.dailyCompletionChart.label');
    expect(translateService.instant).toHaveBeenCalledWith('home.dashboard.taskStatusChart.completed');
    expect(translateService.instant).toHaveBeenCalledWith('home.dashboard.taskStatusChart.inProgress');
    expect(translateService.instant).toHaveBeenCalledWith('home.dashboard.taskStatusChart.todo');
  });
});
