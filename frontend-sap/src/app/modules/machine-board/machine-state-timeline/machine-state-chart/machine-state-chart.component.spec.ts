import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineStateChartComponent } from './machine-state-chart.component';

describe('MachineStateChartComponent', () => {
  let component: MachineStateChartComponent;
  let fixture: ComponentFixture<MachineStateChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineStateChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineStateChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
