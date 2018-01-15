import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { CommentPeriod } from '../models/commentperiod';
// import { CollectionsList } from '../models/collection';

@Injectable()
export class CommentPeriodService {
  commentperiod: CommentPeriod;

  constructor(private api: ApiService) { }

  getById(id: string): Observable<CommentPeriod> {
    return this.api.getCommentPeriodByAppId(id)
      .map((res: Response) => {
        const commentperiods = res.text() ? res.json() : [];
        return commentperiods.length > 0 ? commentperiods[0] : null;
        // return res.text() ? new CommentPeriod(res.json()) : null;
      })
      .map((commentperiod: CommentPeriod) => {
        if (!commentperiod) { return; }

        this.commentperiod = commentperiod;

        //  this.application.collections = new CollectionsList();

        return this.commentperiod;
      })
      .catch(this.api.handleError);
  }
}
