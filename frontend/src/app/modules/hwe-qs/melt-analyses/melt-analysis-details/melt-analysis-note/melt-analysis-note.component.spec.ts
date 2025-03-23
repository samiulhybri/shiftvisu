import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltAnalysisNoteComponent } from './melt-analysis-note.component';

describe('MeltAnalysisNoteComponent', () => {
  let component: MeltAnalysisNoteComponent;
  let fixture: ComponentFixture<MeltAnalysisNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltAnalysisNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltAnalysisNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
