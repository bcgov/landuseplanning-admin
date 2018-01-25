import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';

@Injectable()
export class CommentService {
  public comment: Comment;

  constructor(private api: ApiService) { }

  // get all comments for the specified application id
  getByApplicationId(appId: string): Observable<any> {
    // first get the comment periods
    return this.getPeriodsByAppId(appId)
      .mergeMap(periods => {
        if (periods.length === 0) {
          return Observable.of([]);
        }

        // now get the comments for all comment periods
        // TODO: return comments for all periods
        return this.getCommentsByPeriodId(periods[0]._id);
      });
  }

  private getPeriodsByAppId(appId: string): Observable<any> {
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

  private getCommentsByPeriodId(periodId: string): Observable<any> {
    return this.api.getCommentsByPeriodId(periodId)
      .map((res: Response) => {
        const comments = res.text() ? res.json() : [];

        comments.forEach((comment, index) => {
          comments[index] = new Comment(comment);
        });

        return comments;
      })
      .catch(this.api.handleError);
  }

  // get a specific comment by its id
  getById(commentId: string): Observable<Comment> {
    return this.api.getComment(commentId)
      .map((res: Response) => {
        const comments = res.text() ? res.json() : [];
        return comments.length > 0 ? comments[0] : null;
        // return res.text() ? new Comment(res.json()) : null;
      })
      .map((comment: Comment) => {
        if (!comment) { return; }

        this.comment = comment;

        return this.comment;
      })
      .catch(this.api.handleError);
  }
}
