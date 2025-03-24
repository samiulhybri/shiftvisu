import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineClassificationComponent } from './machine-classification.component';

describe('MachineClassificationComponent', () => {
  let component: MachineClassificationComponent;
  let fixture: ComponentFixture<MachineClassificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineClassificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
