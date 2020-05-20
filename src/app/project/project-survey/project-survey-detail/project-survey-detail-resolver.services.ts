import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SurveyService } from 'app/services/survey.service';

@Injectable()
export class ProjectSurveyDetailResolver implements Resolve<Object> {

  constructor(
    private surveyService: SurveyService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const surveyId = route.paramMap.get('surveyId');

    return this.surveyService.getById(surveyId);
  }

}
