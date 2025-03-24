import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeClassificationsComponent } from './employee-classifications.component';

describe('EmployeeClassificationsComponent', () => {
  let component: EmployeeClassificationsComponent;
  let fixture: ComponentFixture<EmployeeClassificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeClassificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmployeeClassificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
