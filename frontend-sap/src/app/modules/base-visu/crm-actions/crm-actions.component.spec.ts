import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmActionsComponent } from './crm-actions.component';

describe('CrmActionsComponent', () => {
  let component: CrmActionsComponent;
  let fixture: ComponentFixture<CrmActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrmActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
