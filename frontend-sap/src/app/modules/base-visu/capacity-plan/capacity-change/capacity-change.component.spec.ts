import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityChangeComponent } from './capacity-change.component';

describe('CapacityChangeComponent', () => {
  let component: CapacityChangeComponent;
  let fixture: ComponentFixture<CapacityChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CapacityChangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CapacityChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
