import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Comment } from '../models/comment';

@Injectable()
export class CommentService {
  comment: Comment;

  constructor(private api: ApiService) { }

  // get all comments for the specified comment period id
  getAll(id: string) {
    return this.api.getCommentsByPeriodId(id)
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
  getById(id: string): Observable<Comment> {
    return this.api.getComment(id)
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
