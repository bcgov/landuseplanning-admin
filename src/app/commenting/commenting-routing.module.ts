import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageCommentPeriodsComponent } from './manage-comment-periods/manage-comment-periods.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
// import { CommentDetailComponent } from './review-comments/comment-detail/comment-detail.component';
// import { CommentDetailResolver } from './comment-detail-resolver.service';

const routes: Routes = [
  {
    path: 'periods',
    component: ManageCommentPeriodsComponent
  },
  {
    path: 'comments',
    component: ReviewCommentsComponent
  },
  // {
  //   path: 'comment/:commentId',
  //   component: CommentDetailComponent,
  //   resolve: {
  //     comment: CommentDetailResolver
  //   }
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  // providers: [CommentDetailResolver]
})

export class CommentingRoutingModule { }
