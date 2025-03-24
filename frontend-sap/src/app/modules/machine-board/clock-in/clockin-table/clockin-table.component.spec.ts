import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockinTableComponent } from './clockin-table.component';

describe('ClockinTableComponent', () => {
  let component: ClockinTableComponent;
  let fixture: ComponentFixture<ClockinTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClockinTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClockinTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
