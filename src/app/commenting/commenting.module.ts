// modules
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommentingRoutingModule } from './commenting-routing.module';

// components
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { CommentDetailComponent } from './review-comments/comment-detail/comment-detail.component';
import { AddCommentComponent } from './review-comments/add-comment/add-comment.component';

// services
// import { ApiService } from '../services/api';
// import { DocumentService } from '../services/document.service';
// import { ApplicationService } from '../services/application.service';
// import { CommentPeriodService } from '../services/commentperiod.service';
// import { CommentService } from '../services/comment.service';
import { ExcelService } from 'app/services/excel.service';

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
    ReviewCommentsComponent,
    CommentDetailComponent,
    AddCommentComponent
  ],
  exports: [
    ReviewCommentsComponent,
    CommentDetailComponent,
    AddCommentComponent
  ],
  providers: [
    ExcelService
  ],
  entryComponents: [
    AddCommentComponent
  ]
})

export class CommentingModule { }
