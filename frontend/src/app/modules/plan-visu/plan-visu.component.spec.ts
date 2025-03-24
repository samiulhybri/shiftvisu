import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanVisuComponent } from './plan-visu.component';

describe('PlanVisuComponent', () => {
  let component: PlanVisuComponent;
  let fixture: ComponentFixture<PlanVisuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanVisuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanVisuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
