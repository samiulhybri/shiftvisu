import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderViewTreeComponent } from './order-view-tree.component';

describe('OrderViewComponent', () => {
  let component: OrderViewTreeComponent;
  let fixture: ComponentFixture<OrderViewTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderViewTreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderViewTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
