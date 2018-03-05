import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageCommentPeriodsComponent } from './manage-comment-periods/manage-comment-periods.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { ApplicationDetailResolver } from 'app/applications/application-resolver.service';

const routes: Routes = [
  {
    path: 'periods/:appId',
    component: ManageCommentPeriodsComponent,
    resolve: {
      application: ApplicationDetailResolver
    }
  },
  {
    path: 'comments/:appId',
    component: ReviewCommentsComponent,
    resolve: {
      application: ApplicationDetailResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CommentingRoutingModule { }
