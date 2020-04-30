import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentPeriodService } from 'app/services/commentperiod.service';
import { SurveyService } from 'app/services/survey.service';
import { forkJoin, of, from } from 'rxjs';
import { CommentPeriod } from 'app/models/commentPeriod';

@Injectable()
export class CommentPeriodResolver implements Resolve<Object> {

  constructor(
    private commentPeriodService: CommentPeriodService,
    private surveyService: SurveyService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const commentPeriodId = route.paramMap.get('commentPeriodId');
    // force-reload so we always have latest data
    return forkJoin(
      from(this.commentPeriodService.getSummaryById(commentPeriodId)),
      from(this.commentPeriodService.getById(commentPeriodId)),
      from(this.surveyService.getSelectedSurveyByCPId(commentPeriodId))
    ).map(([summary, commentPeriod, surveySelected]) => {
      commentPeriod.summary = summary;
      commentPeriod.surveySelected = surveySelected;
      return new CommentPeriod(commentPeriod);
    });
  }
}
