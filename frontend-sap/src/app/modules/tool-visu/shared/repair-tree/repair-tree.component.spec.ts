import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairTreeComponent } from './repair-tree.component';

describe('RepairTreeComponent', () => {
  let component: RepairTreeComponent;
  let fixture: ComponentFixture<RepairTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepairTreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RepairTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
