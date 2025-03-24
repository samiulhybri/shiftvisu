import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltAnalysesComponent } from './melt-analyses.component';

describe('MeltAnalysesComponent', () => {
  let component: MeltAnalysesComponent;
  let fixture: ComponentFixture<MeltAnalysesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltAnalysesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltAnalysesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
