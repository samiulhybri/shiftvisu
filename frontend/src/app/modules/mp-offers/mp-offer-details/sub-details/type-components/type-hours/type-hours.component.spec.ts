import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeHoursComponent } from './type-hours.component';

describe('TypeHoursComponent', () => {
  let component: TypeHoursComponent;
  let fixture: ComponentFixture<TypeHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeHoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
