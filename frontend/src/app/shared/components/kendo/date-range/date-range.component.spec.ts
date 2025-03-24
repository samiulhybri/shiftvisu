import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangeComponent } from './date-range.component';
import { DebugElement } from '@angular/core';
import { DateRange } from 'src/app/shared/types/date-range.type';
import { By } from '@angular/platform-browser';

describe('DateRangeComponent', () => {
  let component: DateRangeComponent;
  let fixture: ComponentFixture<DateRangeComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateRangeComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a default range', () => {
    expect(component.range).toBeDefined();
    expect(component.range.start instanceof Date).toBeTrue();
    expect(component.range.end instanceof Date).toBeTrue();
  });

  it('should emit the correct date range on close', () => {
    const testRange: DateRange = { start: new Date(2022, 1, 1), end: new Date(2022, 1, 28) };
    spyOn(component.close, 'emit');
    // component.range = testRange;
    component.closeDatePicker();
    expect(component.close.emit).toHaveBeenCalledWith(testRange);
  });

  it('should display the start and end labels', () => {
    const startLabel = debugElement.query(By.css('[text="Start"]'));
    const endLabel = debugElement.query(By.css('[text="End"]'));
    expect(startLabel).toBeTruthy();
    expect(endLabel).toBeTruthy();
  });

  it('should display the default range in the inputs', () => {
    const startInput = debugElement.query(By.css('kendo-dateinput[kendoDateRangeStartInput]'));
    const endInput = debugElement.query(By.css('kendo-dateinput[kendoDateRangeEndInput]'));
    expect(startInput.nativeElement.value).toBe(component.range.start.toISOString().substring(0, 10));
    expect(endInput.nativeElement.value).toBe(component.range.end.toISOString().substring(0, 10));
  });
});
