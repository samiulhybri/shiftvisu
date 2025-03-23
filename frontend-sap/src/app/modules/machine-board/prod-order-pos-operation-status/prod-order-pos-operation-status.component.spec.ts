import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdOrderPosOperationStatusComponent } from './prod-order-pos-operation-status.component';

describe('ProdOrderPosOperationStatusComponent', () => {
  let component: ProdOrderPosOperationStatusComponent;
  let fixture: ComponentFixture<ProdOrderPosOperationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProdOrderPosOperationStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProdOrderPosOperationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
