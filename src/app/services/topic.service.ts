import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { Topic } from 'app/models/topic';

interface GetParameters {
  getDocuments?: boolean;
}

@Injectable()
export class TopicService {

  readonly accepted = 'Accepted';
  readonly pending = 'Pending';
  readonly rejected = 'Rejected';

  constructor(
    private api: ApiService,
  ) { }

  // get all topics
  getAllTopics(pageNum: number = 1, pageSize: number = 10, sortBy: string = null): Observable<Object> {
    return this.api.getTopics(pageNum, pageSize, sortBy)
    .map((res: any) => {
      if (res) {
        const topics: Array<Topic> = [];
        res[0].results.forEach(topic => {
          topics.push(new Topic(topic));
        });
        return { totalCount: res[0].total_items, data: topics };
      }
      return {};
    })
    .catch(error => this.api.handleError(error));
  }

  // add(orig: Comment): Observable<Comment> {
  //   // make a (deep) copy of the passed-in comment so we don't change it
  //   const comment = _.cloneDeep(orig);

  //   // ID must not exist on POST
  //   delete comment._id;

  //   // don't send documents
  //   delete comment.documents;

  //   // replace newlines with \\n (JSON format)
  //   if (comment.comment) {
  //     comment.comment = comment.comment.replace(/\n/g, '\\n');
  //   }
  //   if (comment.review && comment.review.reviewerNotes) {
  //     comment.review.reviewerNotes = comment.review.reviewerNotes.replace(/\n/g, '\\n');
  //   }

  //   return this.api.addComment(comment)
  //     .catch(error => this.api.handleError(error));
  // }

  // save(orig: Comment): Observable<Comment> {
  //   // make a (deep) copy of the passed-in comment so we don't change it
  //   const comment = _.cloneDeep(orig);

  //   // don't send documents
  //   delete comment.documents;

  //   // replace newlines with \\n (JSON format)
  //   if (comment.comment) {
  //     comment.comment = comment.comment.replace(/\n/g, '\\n');
  //   }
  //   if (comment.review && comment.review.reviewerNotes) {
  //     comment.review.reviewerNotes = comment.review.reviewerNotes.replace(/\n/g, '\\n');
  //   }

  //   return this.api.saveComment(comment)
  //     .catch(error => this.api.handleError(error));
  // }

  // publish(comment: Comment): Observable<Comment> {
  //   return this.api.publishComment(comment)
  //     .catch(error => this.api.handleError(error));
  // }

  // unPublish(comment: Comment): Observable<Comment> {
  //   return this.api.unPublishComment(comment)
  //     .catch(error => this.api.handleError(error));
  // }

  // isAccepted(comment: Comment): boolean {
  //   return comment && comment.commentStatus && comment.commentStatus.toLowerCase() === this.accepted.toLowerCase();
  // }

  // isPending(comment: Comment): boolean {
  //   return comment && comment.commentStatus && comment.commentStatus.toLowerCase() === this.pending.toLowerCase();
  // }

  // isRejected(comment: Comment): boolean {
  //   return comment && comment.commentStatus && comment.commentStatus.toLowerCase() === this.rejected.toLowerCase();
  // }

  // doAccept(comment: Comment): Comment {
  //   comment.commentStatus = this.accepted;
  //   return comment;
  // }

  // doPending(comment: Comment): Comment {
  //   comment.commentStatus = this.pending;
  //   return comment;
  // }

  // doReject(comment: Comment): Comment {
  //   comment.commentStatus = this.rejected;
  //   return comment;
  // }

}
