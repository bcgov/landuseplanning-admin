import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodService {
  public commentperiod: CommentPeriod;

  constructor(private api: ApiService) { }

  // get all comment periods for the specified application id
  getAllByApplicationId(appId: string): Observable<CommentPeriod[]> {
    return this.api.getPeriodsByAppId(appId)
      .map((res: Response) => {
        const periods = res.text() ? res.json() : [];

        periods.forEach((period, index) => {
          periods[index] = new CommentPeriod(period);
        });

        return periods;
      })
      .catch(this.api.handleError);
  }

  // get a specific comment period by its id
  getById(periodId: string): Observable<CommentPeriod> {
    return this.api.getPeriod(periodId)
      .map((res: Response) => {
        const periods = res.text() ? res.json() : [];
        // return the first (only) comment period
        return periods.length > 0 ? periods[0] : null;
      })
      .map((period: CommentPeriod) => {
        // if (!period) { return; }

        // cache comment period
        this.commentperiod = period;

        return this.commentperiod;
      })
      .catch(this.api.handleError);
  }

  get(): CommentPeriod {
    return this.commentperiod;
  }

  add(commentperiod: CommentPeriod): Observable<CommentPeriod> {
    return this.api.addCommentPeriod(commentperiod)
      .map((res: Response) => {
        const cp = res.text() ? res.json() : null;
        return cp;
      })
      .catch(this.api.handleError);
  }

  save(commentperiod: CommentPeriod): Observable<CommentPeriod> {
    return this.api.saveCommentPeriod(commentperiod)
      .map((res: Response) => {
        const cp = res.text() ? res.json() : null;
        return cp;
      })
      .catch(this.api.handleError);
  }
}
