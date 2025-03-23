import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalAnalysisDetailsComponent } from './chemical-analysis-details.component';

describe('ChemicalAnalysisDetailsComponent', () => {
  let component: ChemicalAnalysisDetailsComponent;
  let fixture: ComponentFixture<ChemicalAnalysisDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChemicalAnalysisDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemicalAnalysisDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
