import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeformationComponent } from './deformation.component';

describe('DeformationComponent', () => {
  let component: DeformationComponent;
  let fixture: ComponentFixture<DeformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
