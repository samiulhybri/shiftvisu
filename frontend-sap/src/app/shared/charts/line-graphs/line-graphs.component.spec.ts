import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineGraphsComponent } from './line-graphs.component';

describe('LineGraphsComponent', () => {
  let component: LineGraphsComponent;
  let fixture: ComponentFixture<LineGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LineGraphsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LineGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
