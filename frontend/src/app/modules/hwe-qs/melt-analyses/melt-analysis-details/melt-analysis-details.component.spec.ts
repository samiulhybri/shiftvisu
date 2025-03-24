import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltAnalysisDetailsComponent } from './melt-analysis-details.component';

describe('MeltAnalysisDetailsComponent', () => {
  let component: MeltAnalysisDetailsComponent;
  let fixture: ComponentFixture<MeltAnalysisDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltAnalysisDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltAnalysisDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
