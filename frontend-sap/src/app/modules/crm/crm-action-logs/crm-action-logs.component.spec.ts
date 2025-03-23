import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmActionLogsComponent } from './crm-action-logs.component';

describe('CrmActionLogsComponent', () => {
  let component: CrmActionLogsComponent;
  let fixture: ComponentFixture<CrmActionLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmActionLogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrmActionLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
