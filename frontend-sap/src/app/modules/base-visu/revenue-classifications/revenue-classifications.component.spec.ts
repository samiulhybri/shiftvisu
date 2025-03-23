import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueClassificationsComponent } from './revenue-classifications.component';

describe('RevenueClassificationsComponent', () => {
  let component: RevenueClassificationsComponent;
  let fixture: ComponentFixture<RevenueClassificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RevenueClassificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RevenueClassificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
