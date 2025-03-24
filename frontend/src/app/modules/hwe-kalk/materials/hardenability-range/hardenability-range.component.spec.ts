import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HardenabilityRangeComponent } from './hardenability-range.component';

describe('HardenabilityRangeComponent', () => {
  let component: HardenabilityRangeComponent;
  let fixture: ComponentFixture<HardenabilityRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HardenabilityRangeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HardenabilityRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
