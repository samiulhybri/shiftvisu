import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatTreatmentFactorsComponent } from './heat-treatment-factors.component';

describe('HeatTreatmentFactorsComponent', () => {
  let component: HeatTreatmentFactorsComponent;
  let fixture: ComponentFixture<HeatTreatmentFactorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatTreatmentFactorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeatTreatmentFactorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
