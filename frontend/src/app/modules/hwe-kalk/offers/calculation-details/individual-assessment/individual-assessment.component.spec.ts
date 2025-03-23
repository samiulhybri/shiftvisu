import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualAssessmentComponent } from './individual-assessment.component';

describe('IndividualAssessmentComponent', () => {
  let component: IndividualAssessmentComponent;
  let fixture: ComponentFixture<IndividualAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndividualAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividualAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
