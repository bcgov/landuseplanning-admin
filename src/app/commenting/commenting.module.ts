// modules
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommentingRoutingModule } from './commenting-routing.module';

// components
import { ManageCommentPeriodsComponent } from './manage-comment-periods/manage-comment-periods.component';
import { AddEditCommentPeriodComponent } from './manage-comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { CommentDetailComponent } from './review-comments/comment-detail/comment-detail.component';
import { AddCommentComponent } from './review-comments/add-comment/add-comment.component';

// services
// import { ApiService } from '../services/api';
// import { DocumentService } from '../services/document.service';
// import { ApplicationService } from '../services/application.service';
// import { CommentPeriodService } from '../services/commentperiod.service';
// import { CommentService } from '../services/comment.service';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    NgxPaginationModule,
    NgbModule.forRoot(),
    CommentingRoutingModule
  ],
  declarations: [
    ManageCommentPeriodsComponent,
    AddEditCommentPeriodComponent,
    ReviewCommentsComponent,
    CommentDetailComponent,
    AddCommentComponent
  ],
  exports: [
    ManageCommentPeriodsComponent,
    AddEditCommentPeriodComponent,
    ReviewCommentsComponent,
    CommentDetailComponent,
    AddCommentComponent
  ],
  providers: [
    // ApiService,
    // DocumentService,
    // ApplicationService,
    // CommentPeriodService,
    // CommentService,
  ],
  entryComponents: [
    AddEditCommentPeriodComponent,
    AddCommentComponent
  ]
})

export class CommentingModule { }
