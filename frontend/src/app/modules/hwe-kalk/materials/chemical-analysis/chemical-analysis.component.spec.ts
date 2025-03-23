import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalAnalysisComponent } from './chemical-analysis.component';

describe('ChemicalAnalysisComponent', () => {
  let component: ChemicalAnalysisComponent;
  let fixture: ComponentFixture<ChemicalAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChemicalAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemicalAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
