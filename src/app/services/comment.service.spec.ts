import { TestBed, inject } from '@angular/core/testing';

import { CommentService } from './comment.service';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

describe('CommentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentService,
        { provide: ApiService },
        { provide: DocumentService },
        { provide: CommentPeriodService },
      ]
    });
  });

  it('should be created', inject([CommentService], (service: CommentService) => {
    expect(service).toBeTruthy();
  }));
});
