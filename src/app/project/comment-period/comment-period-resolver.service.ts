import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

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

  /**
   * Get route params and make a request to the API to get the comment period
   * summary, the comment period, and all project surveys. Then return all
   * as a single response.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
   resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const commentPeriodId = route.paramMap.get('commentPeriodId');
    const projectId = route.parent.params['projId'];
    // force-reload so we always have latest data
    return forkJoin(
      from(this.commentPeriodService.getSummaryById(commentPeriodId)),
      from(this.commentPeriodService.getById(commentPeriodId)),
      from(this.surveyService.getAllByProjectId(projectId))
    ).map(([summary, commentPeriod, surveys]) => {
      commentPeriod.summary = summary;
      return { commentPeriod: new CommentPeriod(commentPeriod), surveys: surveys};
    });
  }
}
