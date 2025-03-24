import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpPlanPosHeatTreatmentComponent } from './op-plan-pos-heat-treatment.component';

describe('OpPlanPosHeatTreatmentComponent', () => {
  let component: OpPlanPosHeatTreatmentComponent;
  let fixture: ComponentFixture<OpPlanPosHeatTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpPlanPosHeatTreatmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpPlanPosHeatTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
