// modules
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApplicationsRoutingModule } from './applications-routing.module';

// components
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationAsideComponent } from './application-aside/application-aside.component';
import { ApplicationAddEditComponent } from './application-add-edit/application-add-edit.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { CommentDetailComponent } from './review-comments/comment-detail/comment-detail.component';

// services
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { ExcelService } from 'app/services/excel.service';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    NgxPaginationModule,
    NgbModule.forRoot(),
    ApplicationsRoutingModule
  ],
  declarations: [
    ApplicationListComponent,
    ApplicationDetailComponent,
    ApplicationAsideComponent,
    ApplicationAddEditComponent,
    ReviewCommentsComponent,
    CommentDetailComponent
  ],
  exports: [
    ApplicationListComponent,
    ApplicationDetailComponent,
    ApplicationAsideComponent,
    ApplicationAddEditComponent,
    ReviewCommentsComponent,
    CommentDetailComponent
  ],
  providers: [
    ApiService,
    ApplicationService,
    ExcelService
  ]
})

export class ApplicationsModule { }
