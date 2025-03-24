import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgingFactorDetailComponent } from './forging-factor-detail.component';

describe('ForgingFactorDetailComponent', () => {
  let component: ForgingFactorDetailComponent;
  let fixture: ComponentFixture<ForgingFactorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForgingFactorDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgingFactorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
