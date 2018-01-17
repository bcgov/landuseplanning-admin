import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment';

@Injectable()
export class CommentDetailResolver implements Resolve<Comment> {
  constructor(private commentService: CommentService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Comment | Observable<Comment> | Promise<Comment> {
    const commentId = route.paramMap.get('commentId');
    return this.commentService.getById(commentId)
      .catch(err => {
        return Observable.throw(err);
      });
  }
}
