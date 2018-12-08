import { TestBed, inject } from '@angular/core/testing';

import { CommentPeriodService } from './commentperiod.service';
import { ApiService } from 'app/services/api';
import { CommentPeriod } from 'app/models/commentperiod';

describe('CommentPeriodService', () => {
  let service;
  let commentPeriod;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentPeriodService,
        { provide: ApiService }
      ]
    });
    service = TestBed.get(CommentPeriodService);
    commentPeriod = new CommentPeriod({});
  });

  it('should be created', inject([CommentPeriodService], (commentPeriodService: CommentPeriodService) => {
    expect(commentPeriodService).toBeTruthy();
  }));

  describe('getCurrent()', () => {
    it('returns the first comment period passed', () => {
      let secondCommentPeriod = new CommentPeriod({});
      let current = service.getCurrent([commentPeriod, secondCommentPeriod]);
      expect(current).toBe(commentPeriod);
    });

    it('returns null if the array is empty', () => {
      let current = service.getCurrent([]);
      expect(current).toBeNull();
    });
  });

  describe('getStatus()', () => {
    describe('without a comment period', () => {
      it('returns "Not Open"', () => {
        expect(service.getStatus(null)).toBe('Not Open For Commenting');
      });
    });

    describe('without a start date ', () => {
      it('returns "Not Open"', () => {
        commentPeriod.startDate = null;
        expect(service.getStatus(commentPeriod)).toBe('Not Open For Commenting');
      });
    });

    describe('without an end date ', () => {
      it('returns "Not Open"', () => {
        commentPeriod.startDate = Date.now();
        commentPeriod.endDate = null;
        expect(service.getStatus(commentPeriod)).toBe('Not Open For Commenting');
      });
    });

    describe('when end date is before the present time', () => {
      it('returns "Commenting Closed"', () => {
        commentPeriod.startDate = new Date('September 28, 2018 08:24:00');
        commentPeriod.endDate = new Date('December 1, 2018 16:24:00');
        expect(service.getStatus(commentPeriod)).toBe('Commenting Closed');
      });
    });

    describe('when start date is in the future', () => {
      it('returns "Not Started"', () => {
        commentPeriod.startDate = new Date('September 28, 2050 08:24:00');
        commentPeriod.endDate = new Date('December 1, 2050 16:24:00');
        expect(service.getStatus(commentPeriod)).toBe('Commenting Not Started');
      });
    });

    describe('when startDate is before the present time and end date is in the future', () => {
      it('returns "Open', () => {
        commentPeriod.startDate = new Date('September 28, 2010 08:24:00');
        commentPeriod.endDate = new Date('December 1, 2050 16:24:00');
        expect(service.getStatus(commentPeriod)).toBe('Commenting Open');
      });
    });

  });

  describe('isClosed()', () => {
    it('returns "true" if the comment period status is "Closed"', () => {
      commentPeriod.startDate = new Date('September 28, 2018 08:24:00');
      commentPeriod.endDate = new Date('December 1, 2050 16:24:00');
      expect(service.isClosed(commentPeriod)).toBe(false);

      commentPeriod.endDate = new Date('December 1, 2018 16:24:00');
      expect(service.isClosed(commentPeriod)).toBe(true);
    });
  });

  describe('isNotOpen()', () => {
    it('returns "true" if the comment period status is "Not Open"', () => {
      commentPeriod.startDate = new Date('September 28, 2018 08:24:00');
      commentPeriod.endDate = new Date('December 1, 2050 16:24:00');
      expect(service.isNotOpen(commentPeriod)).toBe(false);

      commentPeriod.endDate = null;
      expect(service.isNotOpen(commentPeriod)).toBe(true);
    });
  });

  describe('isNotStarted()', () => {
    it('returns "true" if the comment period status is "Not Started"', () => {
      commentPeriod.startDate = new Date('September 28, 2018 08:24:00');
      commentPeriod.endDate = new Date('December 1, 2050 16:24:00');
      expect(service.isNotStarted(commentPeriod)).toBe(false);

      commentPeriod.startDate = new Date('September 28, 2050 08:24:00');
      expect(service.isNotStarted(commentPeriod)).toBe(true);
    });
  });

  describe('isOpen()', () => {
    it('returns "true" if the comment period status is "Open"', () => {
      commentPeriod.startDate = new Date('September 28, 2010 08:24:00');
      commentPeriod.endDate = new Date('December 1, 2010 08:24:00');
      expect(service.isOpen(commentPeriod)).toBe(false);

      commentPeriod.endDate = new Date('December 1, 2050 16:24:00');

      expect(service.isOpen(commentPeriod)).toBe(true);
    });
  });
});
