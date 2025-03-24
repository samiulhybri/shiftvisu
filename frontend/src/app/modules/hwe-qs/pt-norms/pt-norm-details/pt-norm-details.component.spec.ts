import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtNormDetailsComponent } from './pt-norm-details.component';

describe('PtNormDetailsComponent', () => {
  let component: PtNormDetailsComponent;
  let fixture: ComponentFixture<PtNormDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtNormDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtNormDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
