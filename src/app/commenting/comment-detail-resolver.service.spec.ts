import { TestBed, inject } from '@angular/core/testing';

import { CommentDetailResolver } from './comment-detail-resolver.service';

describe('CommentDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentDetailResolver]
    });
  });

  it('should be created', inject([CommentDetailResolver], (service: CommentDetailResolver) => {
    expect(service).toBeTruthy();
  }));
});
