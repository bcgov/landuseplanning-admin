import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddCommentComponent } from './comment-period/add-comment/add-comment.component';
import { AddDocumentComponent } from './comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { AddEditCommentPeriodComponent } from './comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { AddEditProjectComponent } from 'app/projects/add-edit-project/add-edit-project.component';
import { AddLabelComponent } from './project-documents/add-label/add-label.component';
import { CommentPeriodComponent } from './comment-period/comment-period.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { CommentPeriodsResolver } from './comment-periods/comment-periods-resolver.services';
import { ComplianceComponent } from './compliance/compliance.component';
import { DocumentDetailComponent } from './project-documents/detail/detail.component';
import { DocumentEditComponent } from './project-documents/document-edit/document-edit.component';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectComponent } from './project.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { ProjectShapefilesComponent } from './project-shapefiles/project-shapefiles.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { ReviewCommentComponent } from './comment-period/review-comment/review-comment.component';
import { ReviewSurveyResponseComponent } from './comment-period/review-survey-response/review-survey-response.component';
import { UploadComponent } from './project-documents/upload/upload.component';

import { AddDocumentsResolver } from './comment-periods/add-edit-comment-period/add-documents/add-documents-resolver.services';
import { CommentPeriodResolver } from './comment-period/comment-period-resolver.service';
import { DocumentDetailResolver } from './project-documents/detail/document-detail-resolver.service';
import { DocumentsResolver } from './project-documents/project-document-resolver.services';
import { ShapeFileResolver } from 'app/projects/add-edit-project/project-shapefile-resolver.services';
import { ProjectResolver } from './project-resolver.service';
import { ReviewCommentResolver } from './comment-period/review-comment/review-comment-resolver.service';
import { ReviewSurveyResponseResolver } from './comment-period/review-survey-response/review-survey-response-resolver.service';
import { ProjectUpdatesResolver } from './project-updates/project-updates-resolver.services';
import { ContactsResolver } from 'app/contacts/contacts-resolver.service';
//import { ContactSelectComponent } from 'app/shared/components/contact-select/contact-select.component';
import { LinkOrganizationResolver } from 'app/shared/components/link-organization/link-organization-resolver.services';
import { LinkOrganizationComponent } from 'app/shared/components/link-organization/link-organization.component';
import { ContactSelectResolver } from 'app/shared/components/contact-select/contact-select-resolver.services';
import { ContactSelectComponent } from 'app/shared/components/contact-select/contact-select.component';
import { ShapefilesResolver } from './project-shapefiles/project-shapefile-resolver.services';
import { ProjectSurveyComponent } from './project-survey/project-survey.component';
import { ProjectSurveyDetailComponent } from './project-survey/project-survey-detail/project-survey-detail.component';
import { ProjectSurveyResolver } from './project-survey/project-survey-resolver.services';
import { ProjectSurveyDetailResolver } from './project-survey/project-survey-detail/project-survey-detail-resolver.services';
import { AddEditProjectSurveyComponent } from './project-survey/add-edit-project-survey/add-edit-project-survey.component';
import { AddEditRouteGuard } from './project-survey/add-edit-project-survey/add-edit-project-survey.guard';

const routes: Routes = [
  {
    path: 'p/:projId',
    component: ProjectComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      project: ProjectResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'project-details',
        pathMatch: 'full'
      },
      {
        path: 'edit/link-org',
        component: LinkOrganizationComponent,
        resolve: {
          organizations: LinkOrganizationResolver
        }
      },
      {
        path: 'edit/contact-select',
        component: ContactSelectComponent,
        resolve: {
          users: ContactSelectResolver
        }
      },
      {
        path: 'edit',
        component: AddEditProjectComponent,
        resolve: {
          documents: ShapeFileResolver
        }
      },
      {
        path: 'project-details',
        component: ProjectDetailComponent,
      },
      {
        path: 'project-documents',
        component: ProjectDocumentsComponent,
        resolve: {
          documents: DocumentsResolver
        }
      },
      {
        path: 'project-documents/upload',
        component: UploadComponent,
      },
      {
        path: 'project-documents/edit',
        component: DocumentEditComponent,
      },
      {
        path: 'project-documents/edit/add-label',
        component: AddLabelComponent,
      },
      {
        path: 'project-documents/detail/:docId',
        component: DocumentDetailComponent,
        resolve: {
          document: DocumentDetailResolver
        }
      },
      {
        path: 'project-documents/upload/add-label',
        component: AddLabelComponent,
      },
      {
        path: 'project-shapefiles',
        component: ProjectShapefilesComponent,
        resolve: {
          documents: ShapefilesResolver
        }
      },
      {
        path: 'project-surveys',
        component: ProjectSurveyComponent,
        resolve: {
          surveys: ProjectSurveyResolver
        }
      },
      {
        path: 'project-surveys/add',
        component: AddEditProjectSurveyComponent,
        // canDeactivate: [AddEditRouteGuard]
      },
      {
        path: 's/:surveyId',
        resolve: {
          survey: ProjectSurveyDetailResolver,
        },
        children: [
          {
            path: '',
            redirectTo: 'project-survey-details',
            pathMatch: 'full'
          },
          {
            path: 'project-survey-details',
            component: ProjectSurveyDetailComponent
          },
          {
            path: 'edit',
            component: AddEditProjectSurveyComponent,
            // canDeactivate: [AddEditRouteGuard]
          },
        ]
      },
      {
        path: 'compliance',
        component: ComplianceComponent,
      },
      {
        path: 'project-updates',
        component: ProjectUpdatesComponent,
        resolve: {
          documents: ProjectUpdatesResolver
        }
      },
      {
        path: 'comment-periods/add/add-documents',
        component: AddDocumentComponent,
        resolve: {
          documents: AddDocumentsResolver
        }
      },
      {
        path: 'comment-periods/add',
        component: AddEditCommentPeriodComponent,
        resolve: {
          surveys: ProjectSurveyResolver
        }
      },
      {
        path: 'comment-periods',
        component: CommentPeriodsComponent,
        resolve: {
          periodsAndSurveys: CommentPeriodsResolver
        }
      },
      {
        path: 'cp/:commentPeriodId',
        resolve: {
          cpAndSurveys: CommentPeriodResolver,
        },
        children: [
          {
            path: '',
            redirectTo: 'comment-period-details',
            pathMatch: 'full'
          },
          {
            path: 'add-comment',
            component: AddCommentComponent
          },
          {
            path: 'comment-period-details',
            component: CommentPeriodComponent
          },
          {
            path: 'edit/add-documents',
            component: AddDocumentComponent,
            resolve: {
              documents: AddDocumentsResolver
            }
          },
          {
            path: 'edit',
            component: AddEditCommentPeriodComponent
          },
          {
            path: 'c/:commentId',
            resolve: {
              comment: ReviewCommentResolver
            },
            children: [
              {
                path: '',
                redirectTo: 'comment-details',
                pathMatch: 'full'
              },
              {
                path: 'comment-details',
                component: ReviewCommentComponent
              }
            ]
          },
          {
            path: 'sr/:surveyResponseId',
            resolve: {
              surveyResponse: ReviewSurveyResponseResolver
            },
            children: [
              {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full'
              },
              {
                path: 'details',
                component: ReviewSurveyResponseComponent
              }
            ]
          }
        ]
      },
      {
        path: 'milestones',
        component: MilestonesComponent,
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AddDocumentsResolver,
    CommentPeriodResolver,
    CommentPeriodsResolver,
    DocumentDetailResolver,
    DocumentsResolver,
    ProjectUpdatesResolver,
    DocumentDetailResolver,
    ProjectResolver,
    ProjectSurveyResolver,
    ProjectSurveyDetailResolver,
    ReviewCommentResolver,
    ReviewSurveyResponseResolver,
    // ProjectContactsResolver,
    LinkOrganizationResolver,
    ContactSelectResolver,
    ShapeFileResolver,
    ShapefilesResolver
  ]
})

export class ProjectRoutingModule { }
