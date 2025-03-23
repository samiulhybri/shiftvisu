import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketSegmentsComponent } from './market-segments.component';

describe('MarketSegmentsComponent', () => {
  let component: MarketSegmentsComponent;
  let fixture: ComponentFixture<MarketSegmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketSegmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketSegmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
