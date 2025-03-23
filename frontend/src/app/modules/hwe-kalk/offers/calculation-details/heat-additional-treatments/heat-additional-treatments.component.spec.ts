import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatAdditionalTreatmentsComponent } from './heat-additional-treatments.component';

describe('HeatAdditionalTreatmentsComponent', () => {
  let component: HeatAdditionalTreatmentsComponent;
  let fixture: ComponentFixture<HeatAdditionalTreatmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatAdditionalTreatmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeatAdditionalTreatmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
