import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineKpi1Component } from './machine-kpi-1.component';

describe('MachineKpi1Component', () => {
  let component: MachineKpi1Component;
  let fixture: ComponentFixture<MachineKpi1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineKpi1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineKpi1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
