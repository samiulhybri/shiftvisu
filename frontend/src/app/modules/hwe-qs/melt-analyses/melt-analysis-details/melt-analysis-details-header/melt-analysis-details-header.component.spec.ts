import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltAnalysisDetailsHeaderComponent } from './melt-analysis-details-header.component';

describe('MeltAnalysisDetailsHeaderComponent', () => {
  let component: MeltAnalysisDetailsHeaderComponent;
  let fixture: ComponentFixture<MeltAnalysisDetailsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltAnalysisDetailsHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltAnalysisDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
