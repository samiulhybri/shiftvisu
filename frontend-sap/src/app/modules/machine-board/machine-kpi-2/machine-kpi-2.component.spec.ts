import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineKpi2Component } from './machine-kpi-2.component';

describe('MachineKpi2Component', () => {
  let component: MachineKpi2Component;
  let fixture: ComponentFixture<MachineKpi2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineKpi2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineKpi2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
