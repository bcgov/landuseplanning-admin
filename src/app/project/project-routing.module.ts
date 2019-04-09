import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';

import { CommentPeriodComponent } from './comment-period/comment-period.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { CommentPeriodsResolver } from './comment-periods/comment-periods-resolver.services';
import { ComplianceComponent } from './compliance/compliance.component';
import { MilestonesComponent } from './milestones/milestones.component';
import { ProjectAddEditComponent } from './project-add-edit/project-add-edit.component';
import { ProjectComponent } from './project.component';
import { ProjectContactsComponent } from './project-contacts/project-contacts.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { UploadComponent } from './project-documents/upload/upload.component';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { AddLabelComponent } from './project-documents/add-label/add-label.component';
import { ProjectUpdatesComponent } from './project-updates/project-updates.component';
import { ValuedComponentsComponent } from './valued-components/valued-components.component';
import { DocumentDetailComponent } from './project-documents/detail/detail.component';
import { DocumentEditComponent } from './project-documents/document-edit/document-edit.component';

import { ProjectResolver } from './project-resolver.service';
import { ValuedComponentsResolver } from './valued-components/valued-components-resolver.services';
import { DocumentsResolver } from './project-documents/project-document-resolver.services';
import { DocumentDetailResolver } from './project-documents/detail/document-detail-resolver.service';
import { CommentPeriodResolver } from './comment-period/comment-period-resolver.service';
import { CreateCommentPeriodComponent } from './comment-periods/create-comment-period/create-comment-period.component';

const routes: Routes = [
  {
    path: 'p/:projId',
    component: ProjectComponent,
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
        path: 'compliance',
        component: ComplianceComponent,
      },
      {
        path: 'valued-components',
        component: ValuedComponentsComponent,
        resolve: {
          valuedComponents: ValuedComponentsResolver
        }
      },
      {
        path: 'project-updates',
        component: ProjectUpdatesComponent,
      },
      {
        path: 'project-contracts',
        component: ProjectContactsComponent,
      },
      {
        path: 'cp/:commentPeriodId',
        component: CommentPeriodComponent,
        resolve: {
          commentPeriod: CommentPeriodResolver
        }
      },
      {
        path: 'comment-periods/create',
        component: CreateCommentPeriodComponent,
      },
      {
        path: 'comment-periods',
        component: CommentPeriodsComponent,
        resolve: {
          commentPeriods: CommentPeriodsResolver
        }
      },
      {
        path: 'milestones',
        component: MilestonesComponent,
      },
      {
        path: 'edit',
        component: ProjectAddEditComponent,
        resolve: {
          project: ProjectResolver
        },
        canDeactivate: [CanDeactivateGuard]
      },
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
    ProjectResolver,
    CommentPeriodsResolver,
    CommentPeriodResolver,
    ValuedComponentsResolver,
    DocumentsResolver,
    DocumentDetailResolver
  ]
})

export class ProjectRoutingModule { }
