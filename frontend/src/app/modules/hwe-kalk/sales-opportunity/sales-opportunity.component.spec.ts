import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOpportunityComponent } from './sales-opportunity.component';

describe('SalesOpportunityComponent', () => {
  let component: SalesOpportunityComponent;
  let fixture: ComponentFixture<SalesOpportunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesOpportunityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
