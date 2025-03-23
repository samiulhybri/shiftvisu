import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeFixedWeightComponent } from './type-fixed-weight.component';

describe('TypeFixedWeightComponent', () => {
  let component: TypeFixedWeightComponent;
  let fixture: ComponentFixture<TypeFixedWeightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeFixedWeightComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeFixedWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
