import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingCalculationComponent } from './ring-calculation.component';

describe('RingCalculationComponent', () => {
  let component: RingCalculationComponent;
  let fixture: ComponentFixture<RingCalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RingCalculationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RingCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
