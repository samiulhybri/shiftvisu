import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedOperationsComponent } from './closed-operations.component';

describe('ClosedOperationsComponent', () => {
  let component: ClosedOperationsComponent;
  let fixture: ComponentFixture<ClosedOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClosedOperationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClosedOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
