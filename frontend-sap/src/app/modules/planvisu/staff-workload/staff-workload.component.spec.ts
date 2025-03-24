import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffWorkloadComponent } from './staff-workload.component';

describe('StaffWorkloadComponent', () => {
  let component: StaffWorkloadComponent;
  let fixture: ComponentFixture<StaffWorkloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffWorkloadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaffWorkloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
