import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SurveyService } from 'app/services/survey.service';

@Injectable()
export class ProjectSurveyDetailResolver implements Resolve<Object> {

  constructor(
    private surveyService: SurveyService,
    private router: Router,
  ) { }

  /**
   * Get route params and make a request to the API to get a single
   * survey that matches the request params.
   * 
   * If the survey isn't found, navigate the user to the search page.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const surveyId = route.paramMap.get('surveyId');

    return this.surveyService.getById(surveyId)
            .pipe(catchError(err => {
              alert('Uh-oh, couldn\'t get survey. It may no longer exist.');
              // survey not found --> navigate back to search
              this.router.navigate(['/search']);
              return null;
            }));
  }

}
