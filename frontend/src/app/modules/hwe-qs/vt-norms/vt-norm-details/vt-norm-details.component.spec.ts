import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VtNormDetailsComponent } from './vt-norm-details.component';

describe('VtNormDetailsComponent', () => {
  let component: VtNormDetailsComponent;
  let fixture: ComponentFixture<VtNormDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VtNormDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VtNormDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
