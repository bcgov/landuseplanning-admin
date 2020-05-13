import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SurveyResponseService } from 'app/services/surveyResponse.service';

@Injectable()
export class ReviewSurveyResponseResolver implements Resolve<Object> {

  constructor(
    private surveyResponseService: SurveyResponseService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const surveyResponseId = route.paramMap.get('surveyResponseId');

    // force-reload so we always have latest data
    return this.surveyResponseService.getById(surveyResponseId, true);
  }
}
