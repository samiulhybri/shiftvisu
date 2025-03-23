import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineStateCurrentComponent } from './machine-state-current.component';

describe('MachineStateCurrentComponent', () => {
  let component: MachineStateCurrentComponent;
  let fixture: ComponentFixture<MachineStateCurrentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineStateCurrentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineStateCurrentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
