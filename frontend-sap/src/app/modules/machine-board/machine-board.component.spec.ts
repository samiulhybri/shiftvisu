import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineBoardComponent } from './machine-board.component';

describe('MachineBoardComponent', () => {
  let component: MachineBoardComponent;
  let fixture: ComponentFixture<MachineBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineBoardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
