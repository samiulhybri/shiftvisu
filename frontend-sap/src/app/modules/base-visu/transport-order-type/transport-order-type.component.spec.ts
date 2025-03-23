import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportOrderTypeComponent } from './transport-order-type.component';

describe('TransportOrderTypeComponent', () => {
  let component: TransportOrderTypeComponent;
  let fixture: ComponentFixture<TransportOrderTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransportOrderTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransportOrderTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
