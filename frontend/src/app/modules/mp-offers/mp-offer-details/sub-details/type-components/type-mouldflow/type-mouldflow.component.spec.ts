import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeMouldflowComponent } from './type-mouldflow.component';

describe('TypeMouldflowComponent', () => {
  let component: TypeMouldflowComponent;
  let fixture: ComponentFixture<TypeMouldflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeMouldflowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeMouldflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
