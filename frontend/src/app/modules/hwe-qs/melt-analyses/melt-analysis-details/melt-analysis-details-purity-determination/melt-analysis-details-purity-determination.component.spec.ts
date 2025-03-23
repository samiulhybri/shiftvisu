import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltAnalysisDetailsPurityDeterminationComponent } from './melt-analysis-details-purity-determination.component';

describe('MeltAnalysisDetailsPurityDeterminationComponent', () => {
  let component: MeltAnalysisDetailsPurityDeterminationComponent;
  let fixture: ComponentFixture<MeltAnalysisDetailsPurityDeterminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltAnalysisDetailsPurityDeterminationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltAnalysisDetailsPurityDeterminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
