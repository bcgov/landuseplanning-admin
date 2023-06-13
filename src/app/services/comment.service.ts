import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { Comment } from 'app/models/comment';
import { DocumentService } from './document.service';
import { flatMap, mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

@Injectable()
export class CommentService {

  public pendingCommentCount = 0;
  public nextCommentId = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService
  ) { }


  /**
   * Get count of comments for the specified comment period id.
   * 
   * @param {string} periodId The comment period the count for.
   * @returns {Observable}
   */
  getCountByPeriodId(periodId: string): Observable<number> {
    return this.api.getCountCommentsByPeriodId(periodId)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get comment by ID.
   * 
   * @param {string} commentId The ID to get the comment by.
   * @param {boolean} populateNextComment Whether or not to populate the next comment.
   * @returns {Observable}
   */
  getById(commentId: string, populateNextComment: boolean = false): Observable<Comment> {
    return this.api.getComment(commentId, populateNextComment)
      .pipe(
        flatMap(res => {
          this.pendingCommentCount = res.headers.get('x-pending-comment-count');
          this.nextCommentId = res.headers.get('x-next-comment-id');

          let comments = res.body;
          if (!comments || comments.length === 0) {
            return of(null as Comment);
          }
          // Safety check for null documents or an empty array of documents.
          if (comments[0].documents === null || comments[0].documents && comments[0].documents.length === 0) {
            return of(new Comment(comments[0]));
          }
          // now get the rest of the data for this project
          return this._getExtraAppData(new Comment(comments[0]));
        })
      )
      .catch(error => this.api.handleError(error));
  }

  /**
   * Add a new comment and all of the documents the user attached to it.
   * 
   * @param {Comment} comment The new comment object to add.
   * @param {Array} documentForms The documents form data to add to the comment.
   * @returns {Observable}
   */
  add(comment: Comment, documentForms: Array<FormData> = []): Observable<Comment> {
    if (documentForms.length > 0) {
      let observables = [];
      documentForms.forEach(documentForm => {
        observables.push(this.documentService.add(documentForm));
      });
      return forkJoin(observables)
        .pipe(
          mergeMap(payload => {
            payload.map((document: any) => {
              comment.documents.push(document._id);
            });
            return this.api.addComment(comment);
          })
        );
    } else {
      return this.api.addComment(comment)
        .catch(error => this.api.handleError(error));
    }
  }

  /**
   * Save a comment and make sure to publish/unpublish all attached documents
   * if necessary.
   * 
   * @param {Comment} comment The comment to save.
   * @returns {Observable}
   */
  save(comment: Comment): Observable<Comment> {
    if (comment.documentsList && comment.documentsList.length > 0) {
      // Update documents publish status.
      let observables = [];
      comment.documentsList.forEach(document => {
        if (document.eaoStatus === 'Published') {
          observables.push(this.documentService.publish(document._id));
        } else if (document.eaoStatus === 'Rejected') {
          observables.push(this.documentService.unPublish(document._id));
        }
      });
      comment.documentsList = null;
      const newComment = _.cloneDeep(comment);
      observables.push(this.api.saveComment(newComment));
      return forkJoin(observables)
        .pipe(
          flatMap((payloads: any) => {
            return of(payloads.pop());
          })
        );

    } else {
      // So we don't send this to API.
      comment.documentsList = null;

      // make a (deep) copy of the passed-in comment so we don't change it
      const newComment = _.cloneDeep(comment);

      return this.api.saveComment(newComment)
        .catch(error => this.api.handleError(error));
    }
  }

  /**
   * Set the status of a comment to "publish."
   * 
   * @param {Comment} comment The comment to publish.
   * @returns {Observable}
   */
  publish(comment: Comment): Observable<Comment> {
    return this.api.updateCommentStatus(comment, 'Published')
      .catch(error => this.api.handleError(error));
  }

  /**
   * Set the status of a comment to "deferred."
   * 
   * @param {Comment} comment The comment to defer.
   * @returns {Observable}
   */
  defer(comment: Comment): Observable<Comment> {
    return this.api.updateCommentStatus(comment, 'Deferred')
      .catch(error => this.api.handleError(error));
  }

  /**
   * Set the status of a comment to "rejected."
   * 
   * @param {Comment} comment The comment to reject.
   * @returns {Observable}
   */
  reject(comment: Comment): Observable<Comment> {
    return this.api.updateCommentStatus(comment, 'Rejected')
      .catch(error => this.api.handleError(error));
  }

  /**
   * Remove a status from a comment.
   * 
   * @param {Comment} comment The comment to remove the status on.
   * @returns {Observable}
   */
  removeStatus(comment: Comment): Observable<Comment> {
    return this.api.updateCommentStatus(comment, 'Reset')
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get all comments for the specified comment period id. Results can be
   * sorted and paginated.
   * 
   * @param {string} periodId The comment period ID.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with. 
   * @param {string} sortBy The field to sort by.
   * @param {boolean} count Whether or not to enumerate the total results.
   * @param {object} filter Filter to only include certain fields.
   * @returns {Observable}
   */
  getByPeriodId(periodId: string, pageNum: number = null, pageSize: number = null, sortBy: string = '', count: boolean = true, filter: Object = {}): Observable<Object> {
    return this.api.getCommentsByPeriodId(periodId, pageNum, pageSize, sortBy, count, filter)
      .map((res: any) => {
        if (res) {
          const comments: Array<Comment> = [];
          if (!res || res.length === 0) {
            return { totalCount: 0, data: [] };
          }
          res[0].results.forEach(c => {
            comments.push(new Comment(c));
          });
          return { totalCount: res[0].total_items, data: comments };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Internal helper method to get attached documents on comments.
   * @param {Comment} comment The comment to get attached documents on.
   * @returns {Observable}
   */
  private _getExtraAppData(comment: Comment): Observable<Comment> {
    return forkJoin(
      this.documentService.getByMultiId(comment.documents)
    ).map(payloads => {
      comment.documentsList = payloads[0];
      return comment;
    });
  }
}
