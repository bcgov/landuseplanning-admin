import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// modules
import { SharedModule } from '../shared/shared.module';
import { CommentingRoutingModule } from './commenting-routing.module';

// components
import { ManageCommentPeriodsComponent } from './manage-comment-periods/manage-comment-periods.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { CommentDetailComponent } from './comment-detail/comment-detail.component';

// services
// import { ApiService } from '../services/api';
// import { DocumentService } from '../services/document.service';
// import { ApplicationService } from '../services/application.service';
// import { CommentPeriodService } from '../services/commentperiod.service';
// import { CommentService } from '../services/comment.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CommentingRoutingModule
  ],
  declarations: [
    ManageCommentPeriodsComponent,
    ReviewCommentsComponent,
    CommentDetailComponent
  ],
  exports: [
    ManageCommentPeriodsComponent,
    ReviewCommentsComponent,
    CommentDetailComponent
  ],
  providers: [
    // ApiService,
    // DocumentService,
    // ApplicationService
  ]
})

export class CommentingModule { }
