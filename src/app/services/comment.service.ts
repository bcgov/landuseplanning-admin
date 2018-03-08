import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

import { ApiService } from './api';
import { CommentPeriodService } from './commentperiod.service';
import { DocumentService } from './document.service';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentService {
  private comment: Comment = null;

  constructor(
    private api: ApiService,
    private commentPeriodService: CommentPeriodService,
    private documentService: DocumentService
  ) { }

  // get all comments for the specified application id
  getAllByApplicationId(appId: string): Observable<Comment[]> {
    // first get the comment periods
    return this.commentPeriodService.getAllByApplicationId(appId)
      .mergeMap((periods: CommentPeriod[]) => {
        if (periods.length === 0) {
          return Observable.of([]);
        }

        const promises: Array<Promise<any>> = [];

        // now get the comments for all periods
        periods.forEach(period => {
          promises.push(this.getAllByPeriodId(period._id).toPromise());
        });

        return Promise.all(promises)
          .then((allComments: Comment[][]) => {
            return _.flatten(allComments);
          });
      });
  }

  // get all comments for the specified comment period id
  getAllByPeriodId(periodId: string): Observable<Comment[]> {
    return this.api.getCommentsByPeriodId(periodId)
      .map((res: Response) => {
        const comments = res.text() ? res.json() : [];
        comments.forEach((comment, i) => {
          comments[i] = new Comment(comment);
        });
        return comments;
      })
      .catch(this.api.handleError);
  }

  // get a specific comment by its id
  getById(commentId: string, forceReload: boolean = false): Observable<Comment> {
    if (this.comment && this.comment._id === commentId && !forceReload) {
      return Observable.of(this.comment);
    }

    return this.api.getComment(commentId)
      .map((res: Response) => {
        const comments = res.text() ? res.json() : [];
        // return the first (only) comment
        return comments.length > 0 ? new Comment(comments[0]) : null;
      })
      .map((comment: Comment) => {
        if (!comment) { return null; }

        // now grab the comment documents
        this.documentService.getAllByCommentId(comment._id).subscribe(
          documents => comment.documents = documents,
          error => console.log(error)
        );

        this.comment = comment;
        return this.comment;
      })
      .catch(this.api.handleError);
  }

  add(comment: Comment): Observable<Comment> {
    return this.api.addComment(this.sanitizeComment(comment))
      .map((res: Response) => {
        const c = res.text() ? res.json() : null;
        return c ? new Comment(c) : null;
      })
      .catch(this.api.handleError);
  }

  // deletes object keys the API doesn't want on POST
  private sanitizeComment(comment: Comment): Comment {
    delete comment._id;
    delete comment._addedBy;
    // keep _commentPeriod
    delete comment.commentNumber;
    // keep comment
    // replace newlines with \\n (JSON format)
    comment.comment = comment.comment.replace(/\n/g, '\\n');
    // keep comment.commentAuthor
    // keep comment.commentAuthor.internal
    delete comment.review;
    delete comment.dateAdded;
    delete comment.commentStatus;
    delete comment.documents; // API doesn't even look at this

    return comment;
  }

  save(comment: Comment): Observable<Comment> {
    return this.api.saveComment(comment)
      .map((res: Response) => {
        const c = res.text() ? res.json() : null;
        return c ? new Comment(c) : null;
      })
      .catch(this.api.handleError);
  }

  publish(comment: Comment): Subscription {
    return this.api.publishComment(comment)
      .subscribe(
        value => comment.isPublished = true,
        error => console.log('publish error =', error)
      );
  }

  unPublish(comment: Comment): Subscription {
    return this.api.unPublishComment(comment)
      .subscribe(
        value => comment.isPublished = false,
        error => console.log('unpublish error =', error)
      );
  }
}
