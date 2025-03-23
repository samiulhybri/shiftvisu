import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanHeatTreatmentComponent } from './work-plan-heat-treatment.component';

describe('WorkPlanHeatTreatmentComponent', () => {
  let component: WorkPlanHeatTreatmentComponent;
  let fixture: ComponentFixture<WorkPlanHeatTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanHeatTreatmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkPlanHeatTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
