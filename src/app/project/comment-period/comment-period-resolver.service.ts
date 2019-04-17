import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentPeriodService } from 'app/services/commentperiod.service';

@Injectable()
export class CommentPeriodResolver implements Resolve<Object> {

  constructor(
    private commentPeriodService: CommentPeriodService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const commentPeriodId = route.paramMap.get('commentPeriodId');
    // force-reload so we always have latest data
    return this.commentPeriodService.getById(commentPeriodId);
  }
}
