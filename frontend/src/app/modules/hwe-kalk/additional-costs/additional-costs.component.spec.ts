import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalCostsComponent } from './additional-costs.component';

describe('AdditionalCostsComponent', () => {
  let component: AdditionalCostsComponent;
  let fixture: ComponentFixture<AdditionalCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalCostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
