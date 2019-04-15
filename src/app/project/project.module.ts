// modules
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProjectRoutingModule } from './project-routing.module';
import { SharedModule } from 'app/shared/shared.module';

// components
import { AddEditCommentPeriodComponent } from './comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { AddLabelComponent } from './project-documents/add-label/add-label.component';
import { CommentPeriodComponent } from './comment-period/comment-period.component';
import { CommentPeriodDetailsTabComponent } from './comment-period/comment-period-details-tabs/comment-period-details-tab.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { CommentPeriodsTableRowsComponent } from './comment-periods/comment-periods-table-rows/comment-periods-table-rows.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { DocumentDetailComponent } from './project-documents/detail/detail.component';
import { DocumentTableRowsComponent } from './project-documents/project-document-table-rows/project-document-table-rows.component';
import { IndigenousNationsComponent } from './indigenous-nations/indigenous-nations.component';
import { MatTabsModule, MatMenuModule } from '@angular/material';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectAsideComponent } from './project-aside/project-aside.component';
import { ProjectContactsComponent } from './project-contacts/project-contacts.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { ReviewCommentsTabComponent } from './comment-period/review-comments-tab/review-comments-tab.component';
import { ReviewCommentsTabTableRowsComponent } from './comment-period/review-comments-tab/review-comments-tab-table-rows/review-comments-tab-table-rows.component';
import { UploadComponent } from './project-documents/upload/upload.component';
import { ValuedComponentsComponent } from './valued-components/valued-components.component';
import { ValuedComponentTableRowsComponent } from './valued-components/valued-component-table-rows/valued-component-table-rows.component';

// services
import { ApiService } from 'app/services/api';
import { ExcelService } from 'app/services/excel.service';
import { ProjectService } from 'app/services/project.service';
import { StorageService } from 'app/services/storage.service';
import { DocumentEditComponent } from './project-documents/document-edit/document-edit.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    MatMenuModule,
    MatTabsModule,
    NgxPaginationModule,
    ProjectRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    AddEditCommentPeriodComponent,
    AddLabelComponent,
    CommentPeriodComponent,
    CommentPeriodDetailsTabComponent,
    CommentPeriodsComponent,
    CommentPeriodsTableRowsComponent,
    ComplianceComponent,
    DocumentDetailComponent,
    DocumentDetailComponent,
    DocumentEditComponent,
    DocumentTableRowsComponent,
    IndigenousNationsComponent,
    MilestonesComponent,
    ProjectAsideComponent,
    ProjectContactsComponent,
    ProjectDetailComponent,
    ProjectDocumentsComponent,
    ProjectUpdatesComponent,
    ReviewCommentsTabComponent,
    ReviewCommentsTabTableRowsComponent,
    UploadComponent,
    ValuedComponentsComponent,
    ValuedComponentTableRowsComponent
  ],
  entryComponents: [
    CommentPeriodComponent,
    CommentPeriodsComponent,
    CommentPeriodsTableRowsComponent,
    DocumentTableRowsComponent,
    ReviewCommentsTabTableRowsComponent,
    UploadComponent,
    ValuedComponentTableRowsComponent
  ],
  exports: [
    ComplianceComponent,
    IndigenousNationsComponent,
    MilestonesComponent,
    ProjectAsideComponent,
    ProjectContactsComponent,
    ProjectDetailComponent,
    ProjectUpdatesComponent,
    ValuedComponentsComponent
  ],
  providers: [
    ApiService,
    ExcelService,
    ProjectService,
    StorageService
  ]
})

export class ProjectModule { }
