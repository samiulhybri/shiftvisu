import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmActionGridComponent } from './crm-action-grid.component';

describe('CrmActionGridComponent', () => {
  let component: CrmActionGridComponent;
  let fixture: ComponentFixture<CrmActionGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmActionGridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrmActionGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
