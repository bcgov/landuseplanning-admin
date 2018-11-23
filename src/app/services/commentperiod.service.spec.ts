import { TestBed, inject } from '@angular/core/testing';

import { CommentPeriodService } from './commentperiod.service';
import { ApiService } from 'app/services/api';

describe('CommentPeriodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentPeriodService,
        { provide: ApiService }
      ]
    });
  });

  it('should be created', inject([CommentPeriodService], (service: CommentPeriodService) => {
    expect(service).toBeTruthy();
  }));
});
