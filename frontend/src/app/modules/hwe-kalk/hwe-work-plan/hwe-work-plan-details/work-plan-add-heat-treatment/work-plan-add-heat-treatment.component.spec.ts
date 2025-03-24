import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanAddHeatTreatmentComponent } from './work-plan-add-heat-treatment.component';

describe('WorkPlanAddHeatTreatmentComponent', () => {
  let component: WorkPlanAddHeatTreatmentComponent;
  let fixture: ComponentFixture<WorkPlanAddHeatTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanAddHeatTreatmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkPlanAddHeatTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
