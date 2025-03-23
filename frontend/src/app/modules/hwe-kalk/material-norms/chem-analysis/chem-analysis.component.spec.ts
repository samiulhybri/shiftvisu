import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemAnalysisComponent } from './chem-analysis.component';

describe('ChemAnalysisComponent', () => {
  let component: ChemAnalysisComponent;
  let fixture: ComponentFixture<ChemAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChemAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
