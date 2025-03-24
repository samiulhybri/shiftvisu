import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferPosWorkplanLeadTimesComponent } from './offer-pos-workplan-lead-times.component';

describe('OfferPosWorkplanLeadTimesComponent', () => {
  let component: OfferPosWorkplanLeadTimesComponent;
  let fixture: ComponentFixture<OfferPosWorkplanLeadTimesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferPosWorkplanLeadTimesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferPosWorkplanLeadTimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
