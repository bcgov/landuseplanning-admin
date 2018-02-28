import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageCommentPeriodsComponent } from './manage-comment-periods/manage-comment-periods.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';

const routes: Routes = [
  {
    path: 'periods',
    component: ManageCommentPeriodsComponent
  },
  {
    path: 'comments',
    component: ReviewCommentsComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CommentingRoutingModule { }
