import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltAnalysisDetailsForeheadQuenchingComponent } from './melt-analysis-details-forehead-quenching.component';

describe('MeltAnalysisDetailsForeheadQuenchingComponent', () => {
  let component: MeltAnalysisDetailsForeheadQuenchingComponent;
  let fixture: ComponentFixture<MeltAnalysisDetailsForeheadQuenchingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltAnalysisDetailsForeheadQuenchingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltAnalysisDetailsForeheadQuenchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
