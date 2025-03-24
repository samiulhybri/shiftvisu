import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerialNumberProfileComponent } from './serial-number-profile.component';

describe('SerialNumberProfileComponent', () => {
  let component: SerialNumberProfileComponent;
  let fixture: ComponentFixture<SerialNumberProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SerialNumberProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SerialNumberProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
