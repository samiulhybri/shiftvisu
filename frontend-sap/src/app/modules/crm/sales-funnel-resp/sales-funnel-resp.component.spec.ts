import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesFunnelRespComponent } from './sales-funnel-resp.component';

describe('SalesFunnelRespComponent', () => {
  let component: SalesFunnelRespComponent;
  let fixture: ComponentFixture<SalesFunnelRespComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesFunnelRespComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesFunnelRespComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
