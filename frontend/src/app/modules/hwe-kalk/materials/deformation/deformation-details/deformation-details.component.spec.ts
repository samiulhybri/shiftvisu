import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeformationDetailsComponent } from './deformation-details.component';

describe('DeformationDetailsComponent', () => {
  let component: DeformationDetailsComponent;
  let fixture: ComponentFixture<DeformationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeformationDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeformationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
