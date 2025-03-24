import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HweWorkPlanComponent } from './hwe-work-plan.component';

describe('HweWorkPlanComponent', () => {
  let component: HweWorkPlanComponent;
  let fixture: ComponentFixture<HweWorkPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HweWorkPlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HweWorkPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
