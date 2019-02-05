import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectAddEditComponent } from './project-add-edit/project-add-edit.component';
import { ProjectDetailResolver } from './project-resolver.service';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';

import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';

const routes: Routes = [
  {
    path: 'projects',
    component: ProjectListComponent
  },
  {
    path: 'p/:projId',
    component: ProjectDetailComponent,
    resolve: {
      project: ProjectDetailResolver
    }
  },
  {
    path: 'p/:projId/edit',
    component: ProjectAddEditComponent,
    resolve: {
      project: ProjectDetailResolver
    },
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'comments/:projId',
    component: ReviewCommentsComponent,
    resolve: {
      project: ProjectDetailResolver
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    ProjectDetailResolver
  ]
})

export class ProjectsRoutingModule { }
