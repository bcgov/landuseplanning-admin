import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SurveyService } from 'app/services/survey.service';

@Injectable()
export class ProjectSurveyResolver implements Resolve<Object> {

  constructor(
    private surveyService: SurveyService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const projectId = route.parent.paramMap.get('projId');
    const pageNum = route.params.pageNum ? route.params.pageNum : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    const sortBy = route.params.sortBy ? route.params.sortBy : '-dateStarted';

    // force-reload so we always have latest data
    return this.surveyService.getAllByProjectId(projectId, pageNum, pageSize, sortBy);
  }
}
