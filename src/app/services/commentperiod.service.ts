import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { CommentPeriod } from '../models/commentperiod';

@Injectable()
export class CommentPeriodService {
  commentperiod: CommentPeriod;

  constructor(private api: ApiService) { }

  // get all comment periods for the specified application id
  getAll(id: string) {
    return this.api.getCommentPeriodsByAppId(id)
      .map((res: Response) => {
        const commentperiods = res.text() ? res.json() : [];

        commentperiods.forEach((commentperiod, index) => {
          commentperiods[index] = new CommentPeriod(commentperiod);
        });

        return commentperiods;
      })
      .catch(this.api.handleError);
  }
}
