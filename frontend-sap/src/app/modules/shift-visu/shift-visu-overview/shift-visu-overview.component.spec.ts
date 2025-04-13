import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftVisuOverviewComponent } from './shift-visu-overview.component';

describe('ShiftVisuOverviewComponent', () => {
  let component: ShiftVisuOverviewComponent;
  let fixture: ComponentFixture<ShiftVisuOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftVisuOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShiftVisuOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
