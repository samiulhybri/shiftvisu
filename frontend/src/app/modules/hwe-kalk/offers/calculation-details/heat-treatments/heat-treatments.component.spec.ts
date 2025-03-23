import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatTreatmentsComponent } from './heat-treatments.component';

describe('HeatTreatmentsComponent', () => {
  let component: HeatTreatmentsComponent;
  let fixture: ComponentFixture<HeatTreatmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatTreatmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeatTreatmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
