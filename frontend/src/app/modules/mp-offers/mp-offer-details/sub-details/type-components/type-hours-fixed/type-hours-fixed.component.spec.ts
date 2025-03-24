import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeHoursFixedComponent } from './type-hours-fixed.component';

describe('TypeHoursFixedComponent', () => {
  let component: TypeHoursFixedComponent;
  let fixture: ComponentFixture<TypeHoursFixedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeHoursFixedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeHoursFixedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
