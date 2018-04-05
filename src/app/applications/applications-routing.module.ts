import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationAddEditComponent } from './application-add-edit/application-add-edit.component';
import { ApplicationListResolver, ApplicationDetailResolver } from './application-resolver.service';

import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';

const routes: Routes = [
  {
    path: 'applications',
    component: ApplicationListComponent,
    resolve: {
      applications: ApplicationListResolver
    }
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
    canDeactivate: [CanDeactivateGuard],
    // always run resolvers -- to allow reloading same route
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ApplicationListResolver,
    ApplicationDetailResolver
  ]
})

export class ApplicationsRoutingModule { }
