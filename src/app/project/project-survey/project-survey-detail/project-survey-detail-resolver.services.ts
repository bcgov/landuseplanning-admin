import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';

import { SurveyService } from 'app/services/survey.service';

@Injectable()
export class ProjectSurveyDetailResolver implements Resolve<Object> {

  constructor(
    private surveyService: SurveyService,
    private router: Router,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const surveyId = route.paramMap.get('surveyId');

    return this.surveyService.getById(surveyId)
            .pipe(catchError(err => {
              alert('Uh-oh, couldn\'t survey. It may no longer exist.');
              // survey not found --> navigate back to search
              this.router.navigate(['/search']);
              return null;
            }));
  }

}
