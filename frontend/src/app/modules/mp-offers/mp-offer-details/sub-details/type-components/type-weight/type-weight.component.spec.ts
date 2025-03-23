import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeWeightComponent } from './type-weight.component';

describe('TypeWeightComponent', () => {
  let component: TypeWeightComponent;
  let fixture: ComponentFixture<TypeWeightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeWeightComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
