import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartonPackagingComponent } from './carton-packaging.component';

describe('CartonPackagingComponent', () => {
  let component: CartonPackagingComponent;
  let fixture: ComponentFixture<CartonPackagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CartonPackagingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartonPackagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
