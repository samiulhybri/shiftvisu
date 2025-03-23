import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HweHeatTreatmentCostComponent } from './hwe-heat-treatment-cost.component';

describe('HweHeatTreatmentCostComponent', () => {
  let component: HweHeatTreatmentCostComponent;
  let fixture: ComponentFixture<HweHeatTreatmentCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HweHeatTreatmentCostComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HweHeatTreatmentCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
