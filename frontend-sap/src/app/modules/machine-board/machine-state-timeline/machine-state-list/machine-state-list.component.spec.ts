import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineStateListComponent } from './machine-state-list.component';

describe('MachineStateListComponent', () => {
  let component: MachineStateListComponent;
  let fixture: ComponentFixture<MachineStateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineStateListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineStateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
