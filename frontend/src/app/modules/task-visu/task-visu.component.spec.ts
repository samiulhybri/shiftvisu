import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskVisuComponent } from './task-visu.component';

describe('TaskVisuComponent', () => {
  let component: TaskVisuComponent;
  let fixture: ComponentFixture<TaskVisuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskVisuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskVisuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
