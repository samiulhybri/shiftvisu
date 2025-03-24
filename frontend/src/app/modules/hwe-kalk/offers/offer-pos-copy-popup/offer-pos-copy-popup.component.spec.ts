import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferPosCopyPopupComponent } from './offer-pos-copy-popup.component';

describe('OfferPosCopyPopupComponent', () => {
  let component: OfferPosCopyPopupComponent;
  let fixture: ComponentFixture<OfferPosCopyPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferPosCopyPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferPosCopyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
