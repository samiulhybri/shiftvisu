import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HweKalkCalculationDetailsComponent } from './hwe-kalk-calculation-details.component';

describe('HweKalkCalculationDetailsComponent', () => {
  let component: HweKalkCalculationDetailsComponent;
  let fixture: ComponentFixture<HweKalkCalculationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HweKalkCalculationDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HweKalkCalculationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
