import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentPeriodService } from 'app/services/commentperiod.service';

import { Constants } from 'app/shared/utils/constants';

@Injectable()
export class CommentPeriodsResolver implements Resolve<Object> {

  constructor(
    private commentPeriodService: CommentPeriodService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const projectId = route.parent.paramMap.get('projId');
    const pageNum = Number(route.queryParams['pageNum'] ? route.queryParams['pageNum'] : Constants.tableDefaults.DEFAULT_CURRENT_PAGE);
    const pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : Constants.tableDefaults.DEFAULT_PAGE_SIZE);

    const sortBy = '-dateStarted';

    // force-reload so we always have latest data
    return this.commentPeriodService.getAllByProjectId(projectId, pageNum, pageSize, sortBy);
  }
}
