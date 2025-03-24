import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequencePlanningComponent } from './sequence-planning.component';

describe('SequencePlanningComponent', () => {
  let component: SequencePlanningComponent;
  let fixture: ComponentFixture<SequencePlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequencePlanningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SequencePlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
