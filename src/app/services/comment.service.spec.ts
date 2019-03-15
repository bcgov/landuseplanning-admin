import { TestBed, inject } from '@angular/core/testing';

import { CommentService } from './comment.service';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentperiod';

describe('CommentService', () => {
  let service;
  let comment;
  const commentPeriod = new CommentPeriod({});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentService,
        { provide: ApiService },
        { provide: DocumentService },
        { provide: CommentPeriodService }
      ]
    });

    service = TestBed.get(CommentService);
    comment = new Comment({ commentPeriod: commentPeriod });
  });

  it('should be created', inject([CommentService], (commentService: CommentService) => {
    expect(commentService).toBeTruthy();
  }));

  // These predicate functions do not always return booleans, they can return undefined
  describe('isAccepted()', () => {
    it('returns "true" if the comment status is "Accepted"', () => {
      comment.commentStatus = null;
      expect(service.isAccepted(comment)).toBeFalsy();

      comment.commentStatus = 'Pending';
      expect(service.isAccepted(comment)).toBe(false);

      comment.commentStatus = 'Accepted';
      expect(service.isAccepted(comment)).toBe(true);
    });
  });

  describe('isPending()', () => {
    it('returns "true" if the comment status is "Pending"', () => {
      comment.commentStatus = null;
      expect(service.isPending(comment)).toBeFalsy();

      comment.commentStatus = 'Accepted';
      expect(service.isPending(comment)).toBe(false);

      comment.commentStatus = 'Pending';
      expect(service.isPending(comment)).toBe(true);
    });
  });

  describe('isRejected()', () => {
    it('returns "true" if the comment status is "Rejected"', () => {
      comment.commentStatus = null;
      expect(service.isRejected(comment)).toBeFalsy();

      comment.commentStatus = 'Accepted';
      expect(service.isRejected(comment)).toBe(false);

      comment.commentStatus = 'Rejected';
      expect(service.isRejected(comment)).toBe(true);
    });
  });

  describe('doAccept()', () => {
    it('sets the comment status to "Accepted"', () => {
      comment.commentStatus = 'Pending';
      service.doAccept(comment);
      expect(comment.commentStatus).toBe('Accepted');
    });
  });

  describe('doPending()', () => {
    it('sets the comment status to "Pending"', () => {
      comment.commentStatus = 'Accepted';
      service.doPending(comment);
      expect(comment.commentStatus).toBe('Pending');
    });
  });

  describe('doReject()', () => {
    it('sets the comment status to "Rejected"', () => {
      comment.commentStatus = 'Pending';
      service.doReject(comment);
      expect(comment.commentStatus).toBe('Rejected');
    });
  });
});
