import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatTreatmentFactorDetailComponent } from './heat-treatment-factor-detail.component';

describe('HeatTreatmentFactorDetailComponent', () => {
  let component: HeatTreatmentFactorDetailComponent;
  let fixture: ComponentFixture<HeatTreatmentFactorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatTreatmentFactorDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeatTreatmentFactorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
