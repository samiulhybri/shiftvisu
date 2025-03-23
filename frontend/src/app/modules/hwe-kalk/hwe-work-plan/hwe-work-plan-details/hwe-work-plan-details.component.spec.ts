import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HweWorkPlanDetailsComponent } from './hwe-work-plan-details.component';

describe('HweWorkPlanDetailsComponent', () => {
  let component: HweWorkPlanDetailsComponent;
  let fixture: ComponentFixture<HweWorkPlanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HweWorkPlanDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HweWorkPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
