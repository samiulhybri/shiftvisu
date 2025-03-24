import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HardenabilityRangeDetailsComponent } from './hardenability-range-details.component';

describe('HardenabilityRangeDetailsComponent', () => {
  let component: HardenabilityRangeDetailsComponent;
  let fixture: ComponentFixture<HardenabilityRangeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HardenabilityRangeDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HardenabilityRangeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
