import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeDimensionComponent } from './type-dimension.component';

describe('TypeDimensionComponent', () => {
  let component: TypeDimensionComponent;
  let fixture: ComponentFixture<TypeDimensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeDimensionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeDimensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
