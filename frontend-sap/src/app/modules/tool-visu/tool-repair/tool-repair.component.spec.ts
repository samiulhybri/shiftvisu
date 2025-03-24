import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolRepairComponent } from './tool-repair.component';

describe('ToolRepairComponent', () => {
  let component: ToolRepairComponent;
  let fixture: ComponentFixture<ToolRepairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolRepairComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToolRepairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
