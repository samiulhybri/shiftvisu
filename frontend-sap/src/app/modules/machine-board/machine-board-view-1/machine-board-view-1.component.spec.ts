import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineBoardView1Component } from './machine-board-view-1.component';

describe('MachineBoardView1Component', () => {
  let component: MachineBoardView1Component;
  let fixture: ComponentFixture<MachineBoardView1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineBoardView1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineBoardView1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
