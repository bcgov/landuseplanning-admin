import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentService } from 'app/services/comment.service';

@Injectable()
export class ReviewCommentResolver implements Resolve<Object> {

  constructor(
    private commentService: CommentService
  ) { }

  /**
   * Get route params and make a request to the API to get a single
   * comment.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
   resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const commentId = route.paramMap.get('commentId');

    // force-reload so we always have latest data
    return this.commentService.getById(commentId, true);
  }
}
