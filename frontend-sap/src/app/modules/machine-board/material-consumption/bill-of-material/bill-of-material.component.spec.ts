import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillOfMaterialComponent } from './bill-of-material.component';

describe('BillOfMaterialComponent', () => {
  let component: BillOfMaterialComponent;
  let fixture: ComponentFixture<BillOfMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillOfMaterialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillOfMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
