import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintingLineComponent } from './painting-line.component';

describe('PaintingLineComponent', () => {
  let component: PaintingLineComponent;
  let fixture: ComponentFixture<PaintingLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaintingLineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaintingLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
