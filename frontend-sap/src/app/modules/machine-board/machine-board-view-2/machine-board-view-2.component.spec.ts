import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineBoardView2Component } from './machine-board-view-2.component';

describe('MachineBoardView2Component', () => {
  let component: MachineBoardView2Component;
  let fixture: ComponentFixture<MachineBoardView2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineBoardView2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineBoardView2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
