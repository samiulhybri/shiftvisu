import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeOverviewComponent } from './range-overview.component';

describe('RangeOverviewComponent', () => {
  let component: RangeOverviewComponent;
  let fixture: ComponentFixture<RangeOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RangeOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RangeOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
