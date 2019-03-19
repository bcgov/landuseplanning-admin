import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentPeriodService } from 'app/services/commentperiod.service';

@Injectable()
export class CommentPeriodsResolver implements Resolve<Object> {

  constructor(
    private commentPeriodService: CommentPeriodService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const projectId = route.parent.paramMap.get('projId');
    const pageNum = Number(route.queryParams['pageNum'] ? route.queryParams['pageNum'] : 1);
    const pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : 10);

    const sortBy = '-dateStarted';

    // force-reload so we always have latest data
    return this.commentPeriodService.getAllByProjectId(projectId, pageNum, pageSize, sortBy);
  }
}
