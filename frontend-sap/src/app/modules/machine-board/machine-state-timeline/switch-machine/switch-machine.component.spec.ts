import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchMachineComponent } from './switch-machine.component';

describe('SwitchMachineComponent', () => {
  let component: SwitchMachineComponent;
  let fixture: ComponentFixture<SwitchMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SwitchMachineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SwitchMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
