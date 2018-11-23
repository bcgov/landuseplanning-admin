import { TestBed, inject } from '@angular/core/testing';

import { ApplicationService } from './application.service';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';
import { DecisionService } from 'app/services/decision.service';
import { FeatureService } from 'app/services/feature.service';

describe('ApplicationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicationService,
        { provide: ApiService },
        { provide: DocumentService },
        { provide: CommentPeriodService },
        { provide: CommentService },
        { provide: DecisionService },
        { provide: FeatureService },
      ]
    });
  });

  it('should be created', inject([ApplicationService], (service: ApplicationService) => {
    expect(service).toBeTruthy();
  }));
});
