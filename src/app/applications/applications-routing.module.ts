import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationAddEditComponent } from './application-add-edit/application-add-edit.component';
import { ApplicationDetailResolver } from './application-resolver.service';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';

import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';

const routes: Routes = [
  {
    path: 'applications',
    component: ApplicationListComponent
  },
  {
    path: 'a/:appId',
    component: ApplicationDetailComponent,
    resolve: {
      application: ApplicationDetailResolver
    }
  },
  {
    path: 'a/:appId/edit',
    component: ApplicationAddEditComponent,
    resolve: {
      application: ApplicationDetailResolver
    },
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'comments/:appId',
    component: ReviewCommentsComponent,
    resolve: {
      application: ApplicationDetailResolver
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
    ApplicationDetailResolver
  ]
})

export class ApplicationsRoutingModule { }
