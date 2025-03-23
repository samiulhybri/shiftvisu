import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingRollingFactorComponent } from './forging-factors.component';

describe('RingRollingFactorComponent', () => {
  let component: RingRollingFactorComponent;
  let fixture: ComponentFixture<RingRollingFactorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RingRollingFactorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RingRollingFactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
