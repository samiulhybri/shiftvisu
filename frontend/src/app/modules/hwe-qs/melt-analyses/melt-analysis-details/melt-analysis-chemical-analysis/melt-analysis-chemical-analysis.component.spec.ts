import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltAnalysisChemicalAnalysisComponent } from './melt-analysis-chemical-analysis.component';

describe('MeltAnalysisChemicalAnalysisComponent', () => {
  let component: MeltAnalysisChemicalAnalysisComponent;
  let fixture: ComponentFixture<MeltAnalysisChemicalAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltAnalysisChemicalAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltAnalysisChemicalAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
