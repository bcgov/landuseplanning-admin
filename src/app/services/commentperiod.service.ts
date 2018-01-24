import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodService {
  // commentperiod: CommentPeriod;

  constructor(private api: ApiService) { }

  // TODO:
  // update review-comments component to use getByApplicationId()
  // and then delete getAll()
  getAll(id: string) {
    return this.getByApplicationId(id);
  }

  // get all comment periods for the specified application id
  getByApplicationId(appId: string) {
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
}
