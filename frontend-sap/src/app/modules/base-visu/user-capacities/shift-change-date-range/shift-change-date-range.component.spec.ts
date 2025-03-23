import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftChangeDateRangeComponent } from './shift-change-date-range.component';

describe('ShiftChangeDateRangeComponent', () => {
  let component: ShiftChangeDateRangeComponent;
  let fixture: ComponentFixture<ShiftChangeDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftChangeDateRangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShiftChangeDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
