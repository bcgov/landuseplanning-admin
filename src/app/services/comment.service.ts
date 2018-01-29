import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';

import { ApiService } from './api';
import { CommentPeriodService } from './commentperiod.service';
import { Comment } from 'app/models/comment';

@Injectable()
export class CommentService {
  public comment: Comment;

  constructor(
    private api: ApiService,
    private commentPeriodService: CommentPeriodService
  ) { }

  // get all comments for the specified application id
  getAllByApplicationId(appId: string): Observable<Comment[]> {
    // first get the comment periods
    return this.commentPeriodService.getAllByApplicationId(appId)
      .mergeMap(periods => {
        if (periods.length === 0) {
          return Observable.of([]);
        }

        // now get the comments
        // TODO: return comments for all periods
        return this.getAllByPeriodId(periods[0]._id);
      });
  }

  // get all comments for the specified comment period id
  getAllByPeriodId(periodId: string): Observable<Comment[]> {
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
        // return the first (only) comment
        return comments.length > 0 ? comments[0] : null;
      })
      .map((comment: Comment) => {
        // if (!comment) { return; }

        // cache comment
        this.comment = comment;

        return this.comment;
      })
      .catch(this.api.handleError);
  }

  add(comment: Comment): Observable<Comment> {
    return this.api.addComment(comment)
      .map((res: Response) => {
        const c = res.text() ? res.json() : null;
        return c;
      })
      .catch(this.api.handleError);
  }

  save(comment: Comment): Observable<Comment> {
    return this.api.saveComment(comment)
      .map((res: Response) => {
        const c = res.text() ? res.json() : null;
        return c;
      })
      .catch(this.api.handleError);
  }
}
