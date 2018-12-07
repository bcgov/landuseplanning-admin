import { TestBed, inject } from '@angular/core/testing';

import { CommentPeriodService } from './commentperiod.service';

describe('CommentPeriodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentPeriodService]
    });
  });

  it('should be created', inject([CommentPeriodService], (service: CommentPeriodService) => {
    expect(service).toBeTruthy();
  }));
});
