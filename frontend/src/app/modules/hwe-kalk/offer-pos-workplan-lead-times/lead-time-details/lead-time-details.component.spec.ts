import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadTimeDetailsComponent } from './lead-time-details.component';

describe('LeadTimeDetailsComponent', () => {
  let component: LeadTimeDetailsComponent;
  let fixture: ComponentFixture<LeadTimeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadTimeDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadTimeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
