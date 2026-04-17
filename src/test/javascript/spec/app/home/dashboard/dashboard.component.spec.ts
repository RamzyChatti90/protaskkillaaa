import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.model';
import Chart from 'chart.js/auto';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockDashboardService: Partial<DashboardService>;

  const mockDashboardData: DashboardData = {
    totalTasks: 100,
    completedTasks: 50,
    inProgressTasks: 30,
    tasksByStatus: [
      { status: 'TODO', count: 20 },
      { status: 'IN_PROGRESS', count: 30 },
      { status: 'DONE', count: 50 },
    ],
    dailyTaskCompletion: [
      { date: '2023-01-01', completedTasks: 5 },
      { date: '2023-01-02', completedTasks: 8 },
      { date: '2023-01-03', completedTasks: 12 },
      { date: '2023-01-04', completedTasks: 10 },
      { date: '2023-01-05', completedTasks: 7 },
      { date: '2023-01-06', completedTasks: 15 },
      { date: '2023-01-07', completedTasks: 20 },
    ],
  };

  beforeEach(async () => {
    mockDashboardService = {
      getDashboardData: () => of(mockDashboardData),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardComponent],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    // Mock Chart.js to prevent actual chart rendering in tests
    spyOn(Chart.prototype, 'destroy');
    spyOn<any>(component, 'renderCharts').and.callThrough(); // Spy on renderCharts to ensure it's called

    fixture.detectChanges(); // Calls ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(component.isLoading()).toBe(false);
    expect(component.dashboardData()).toEqual(mockDashboardData);
    expect(component.renderCharts).toHaveBeenCalled();
  });

  it('should render charts with correct data', () => {
    // Ensure renderCharts is called and data is passed
    const data = component.dashboardData();
    expect(data).toEqual(mockDashboardData);

    // Check if Chart constructor is called (indirectly via renderCharts)
    // We cannot directly spy on the Chart constructor, but we can check if destroy is called on cleanup
    // and ensure the renderCharts method was invoked.

    // Simulate chart creation (we can't directly check the constructor args without more advanced mocking)
    component.renderCharts();
    expect(Chart.prototype.destroy).toHaveBeenCalledTimes(2); // Initial call + one in renderCharts
    expect(component.dailyCompletionChart).toBeDefined();
    expect(component.tasksByStatusChart).toBeDefined();
  });

  it('should destroy charts on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(Chart.prototype.destroy).toHaveBeenCalledTimes(4); // 2 from previous renderCharts, 2 from ngOnDestroy
  });

  it('should handle error when loading dashboard data', () => {
    const errorSubject = new Subject<any>();
    mockDashboardService.getDashboardData = () => errorSubject;

    component.loadDashboardData(); // Call to trigger new subscription

    errorSubject.error('Test Error');

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Erreur lors du chargement des données du tableau de bord.');
    expect(component.dashboardData()).toBeNull();
  });
});
