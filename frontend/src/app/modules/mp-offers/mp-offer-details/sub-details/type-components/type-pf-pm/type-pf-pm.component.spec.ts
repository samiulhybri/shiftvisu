import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePfPmComponent } from './type-pf-pm.component';

describe('TypePfPmComponent', () => {
  let component: TypePfPmComponent;
  let fixture: ComponentFixture<TypePfPmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypePfPmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypePfPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
