import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineWorkloadComponent } from './machine-workload.component';

describe('MachineWorkloadComponent', () => {
  let component: MachineWorkloadComponent;
  let fixture: ComponentFixture<MachineWorkloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineWorkloadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineWorkloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
