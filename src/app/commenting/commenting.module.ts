// modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommentingRoutingModule } from './commenting-routing.module';

// components
import { ManageCommentPeriodsComponent } from './manage-comment-periods/manage-comment-periods.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { CommentDetailComponent } from './review-comments/comment-detail/comment-detail.component';
import { AddEditCommentPeriodComponent } from './manage-comment-periods/add-edit-comment-period/add-edit-comment-period.component';

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
    NgbModule.forRoot(),
    CommentingRoutingModule
  ],
  declarations: [
    ManageCommentPeriodsComponent,
    ReviewCommentsComponent,
    CommentDetailComponent,
    AddEditCommentPeriodComponent
  ],
  exports: [
    ManageCommentPeriodsComponent,
    ReviewCommentsComponent,
    CommentDetailComponent,
    AddEditCommentPeriodComponent
  ],
  providers: [
    // ApiService,
    // DocumentService,
    // ApplicationService,
    // CommentPeriodService,
    // CommentService,
  ],
  entryComponents: [
    AddEditCommentPeriodComponent
  ]
})

export class CommentingModule { }
