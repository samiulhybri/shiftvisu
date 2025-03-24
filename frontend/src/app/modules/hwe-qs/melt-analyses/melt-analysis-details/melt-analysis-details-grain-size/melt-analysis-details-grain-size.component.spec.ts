import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltAnalysisDetailsGrainSizeComponent } from './melt-analysis-details-grain-size.component';

describe('MeltAnalysisDetailsGrainSizeComponent', () => {
  let component: MeltAnalysisDetailsGrainSizeComponent;
  let fixture: ComponentFixture<MeltAnalysisDetailsGrainSizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltAnalysisDetailsGrainSizeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltAnalysisDetailsGrainSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
