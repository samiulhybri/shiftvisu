import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HweHeatTreatmentCostDetailsComponent } from './hwe-heat-treatment-cost-details.component';

describe('HweHeatTreatmentCostDetailsComponent', () => {
  let component: HweHeatTreatmentCostDetailsComponent;
  let fixture: ComponentFixture<HweHeatTreatmentCostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HweHeatTreatmentCostDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HweHeatTreatmentCostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
