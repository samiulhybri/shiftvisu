import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeFixedNameComponent } from './type-fixed-name.component';

describe('TypeFixedNameComponent', () => {
  let component: TypeFixedNameComponent;
  let fixture: ComponentFixture<TypeFixedNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeFixedNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeFixedNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
