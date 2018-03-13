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
  readonly accepted = 'Accepted';
  readonly pending = 'Pending';
  readonly rejected = 'Rejected';

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
          return Observable.of([] as Comment[]);
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
      .map((comments: Comment[]) => {
        if (comments.length === 0) {
          return [] as Comment[];
        }

        // replace \\n (JSON format) with newlines in each comment
        comments.forEach((comment, i) => {
          if (comments[i].comment) {
            comments[i].comment = comments[i].comment.replace(/\\n/g, '\n');
          }
          if (comments[i].review && comments[i].review.reviewerNotes) {
            comments[i].review.reviewerNotes = comments[i].review.reviewerNotes.replace(/\\n/g, '\n');
          }
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
        if (!comment) { return null as Comment; }

        // replace \\n (JSON format) with newlines
        if (comment.comment) {
          comment.comment = comment.comment.replace(/\\n/g, '\n');
        }
        if (comment.review && comment.review.reviewerNotes) {
          comment.review.reviewerNotes = comment.review.reviewerNotes.replace(/\\n/g, '\n');
        }

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

  add(orig: Comment): Observable<Comment> {
    // make a copy of the passed-in comment so we don't change it
    const comment = Object.assign({}, orig);

    // ID must not exist on POST
    delete comment._id;

    // don't send documents
    delete comment.documents;

    // replace newlines with \\n (JSON format)
    if (comment.comment) {
      comment.comment = comment.comment.replace(/\n/g, '\\n');
    }
    if (comment.review && comment.review.reviewerNotes) {
      comment.review.reviewerNotes = comment.review.reviewerNotes.replace(/\n/g, '\\n');
    }

    return this.api.addComment(comment)
      .map((res: Response) => {
        const c = res.text() ? res.json() : null;
        return c ? new Comment(c) : null;
      })
      .catch(this.api.handleError);
  }

  save(orig: Comment): Observable<Comment> {
    // make a copy of the passed-in comment so we don't change it
    const comment = Object.assign({}, orig);

    // don't send documents
    delete comment.documents;

    // replace newlines with \\n (JSON format)
    if (comment.comment) {
      comment.comment = comment.comment.replace(/\n/g, '\\n');
    }
    if (comment.review && comment.review.reviewerNotes) {
      comment.review.reviewerNotes = comment.review.reviewerNotes.replace(/\n/g, '\\n');
    }

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

  isAccepted(comment: Comment): boolean { return comment.commentStatus === this.accepted; }

  isPending(comment: Comment): boolean { return comment.commentStatus === this.pending; }

  isRejected(comment: Comment): boolean { return comment.commentStatus === this.rejected; }

  doAccept(comment: Comment): Comment {
    comment.commentStatus = this.accepted;
    return comment;
  }

  doPending(comment: Comment): Comment {
    comment.commentStatus = this.pending;
    return comment;
  }

  doReject(comment: Comment): Comment {
    comment.commentStatus = this.rejected;
    return comment;
  }
}
