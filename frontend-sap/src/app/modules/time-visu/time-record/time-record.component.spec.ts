import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeRecordComponent } from './time-record.component';

describe('TimeRecordComponent', () => {
  let component: TimeRecordComponent;
  let fixture: ComponentFixture<TimeRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeRecordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
