// modules
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProjectRoutingModule } from './project-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';


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
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { ProjectShapefilesComponent } from './project-shapefiles/project-shapefiles.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { ReviewCommentsTabComponent } from './comment-period/review-comments-tab/review-comments-tab.component';
import { ReviewCommentsTabTableRowsComponent } from './comment-period/review-comments-tab/review-comments-tab-table-rows/review-comments-tab-table-rows.component';
import { ShapefileTableRowsComponent } from './project-shapefiles/project-shapefile-table-rows/project-shapefile-table-rows.component';
import { UploadComponent } from './project-documents/upload/upload.component';

// services
import { ApiService } from 'app/services/api';
import { ExcelService } from 'app/services/excel.service';
import { ProjectService } from 'app/services/project.service';
import { StorageService } from 'app/services/storage.service';
import { DocumentEditComponent } from './project-documents/document-edit/document-edit.component';
import { ReviewCommentComponent } from './comment-period/review-comment/review-comment.component';
import { AddDocumentComponent } from './comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { AddDocumentTableRowsComponent } from './comment-periods/add-edit-comment-period/add-documents/add-document-table-rows/add-document-table-rows.component';
import { AddCommentComponent } from './comment-period/add-comment/add-comment.component';
import { CommentPeriodBannerComponent } from './comment-period-banner/comment-period-banner.component';
import { ProjectSurveyComponent } from './project-survey/project-survey.component';
import { AddEditProjectSurveyComponent } from './project-survey/add-edit-project-survey/add-edit-project-survey.component';
import { ProjectSurveyTableRowsComponent } from './project-survey/project-survey-table-rows/project-survey-table-rows.component';
// import { SurveyFormBuilderComponent } from './project-survey/add-edit-project-survey/survey-form-builder/survey-form-builder.component';
// import { SurveyFormQuestionComponent } from './project-survey/add-edit-project-survey/survey-form-question/survey-form-question.component';
import { ProjectSurveyDetailComponent } from './project-survey/project-survey-detail/project-survey-detail.component';
import { ReviewSurveyResponsesTabComponent } from './comment-period/review-survey-responses-tab/review-survey-responses-tab.component';
import { ReviewSurveyResponsesTabTableRowsComponent } from './comment-period/review-survey-responses-tab/review-survey-responses-tab-table-rows/review-survey-responses-tab-table-rows.component';
import { ReviewSurveyResponseComponent } from './comment-period/review-survey-response/review-survey-response.component';

// Routes Guards
import { AddEditRouteGuard } from './project-survey/add-edit-project-survey/add-edit-project-survey.guard'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    MatMenuModule,
    MatTabsModule,
    MatCheckboxModule,
    NgxPaginationModule,
    ProjectRoutingModule,
    ReactiveFormsModule,
    CKEditorModule,
    SharedModule,
    DragDropModule,
    MatGridListModule,
    MatInputModule,
    MatButtonModule
  ],
  declarations: [
    AddCommentComponent,
    AddDocumentComponent,
    AddDocumentTableRowsComponent,
    AddEditCommentPeriodComponent,
    AddLabelComponent,
    CommentPeriodBannerComponent,
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
    ProjectDetailComponent,
    ProjectDocumentsComponent,
    ProjectShapefilesComponent,
    ProjectUpdatesComponent,
    ReviewCommentComponent,
    ReviewCommentsTabComponent,
    ReviewCommentsTabTableRowsComponent,
    ShapefileTableRowsComponent,
    UploadComponent,
    ProjectSurveyComponent,
    AddEditProjectSurveyComponent,
    ProjectSurveyTableRowsComponent,
    // SurveyFormBuilderComponent,
    // SurveyFormQuestionComponent,
    ProjectSurveyDetailComponent,
    ReviewSurveyResponsesTabComponent,
    ReviewSurveyResponsesTabTableRowsComponent,
    ReviewSurveyResponseComponent,
  ],
  entryComponents: [
    AddDocumentTableRowsComponent,
    CommentPeriodComponent,
    CommentPeriodsComponent,
    CommentPeriodsTableRowsComponent,
    DocumentTableRowsComponent,
    ReviewCommentsTabTableRowsComponent,
    ShapefileTableRowsComponent,
    UploadComponent,
  ],
  exports: [
    ComplianceComponent,
    IndigenousNationsComponent,
    MilestonesComponent,
    ProjectDetailComponent,
    ProjectUpdatesComponent,
  ],
  providers: [
    AddEditRouteGuard,
    ApiService,
    ExcelService,
    ProjectService,
    StorageService,
  ]
})

export class ProjectModule { }
