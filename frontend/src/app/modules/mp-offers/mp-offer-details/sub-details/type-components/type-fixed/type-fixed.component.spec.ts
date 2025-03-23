import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeFixedComponent } from './type-fixed.component';

describe('TypeFixedComponent', () => {
  let component: TypeFixedComponent;
  let fixture: ComponentFixture<TypeFixedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeFixedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeFixedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
