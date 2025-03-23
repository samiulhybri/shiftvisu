import { TestBed } from '@angular/core/testing';

import { ActionReportService } from './action-report.service';

describe('ActionReportService', () => {
  let service: ActionReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
