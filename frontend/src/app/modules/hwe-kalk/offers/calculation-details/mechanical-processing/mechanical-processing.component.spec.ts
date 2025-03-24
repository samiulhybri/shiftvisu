import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MechanicalProcessingComponent } from './mechanical-processing.component';

describe('MechanicalProcessingComponent', () => {
  let component: MechanicalProcessingComponent;
  let fixture: ComponentFixture<MechanicalProcessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MechanicalProcessingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MechanicalProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
