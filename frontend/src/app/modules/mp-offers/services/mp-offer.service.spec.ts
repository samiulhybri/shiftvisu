import { TestBed } from '@angular/core/testing';

import { MpOfferService } from './mp-offer.service';

describe('MpOfferService', () => {
  let service: MpOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MpOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
