import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationAddEditComponent } from './application-add-edit/application-add-edit.component';
import { ApplicationListResolver, ApplicationDetailResolver } from './application-resolver.service';

import { TAB_NAV_ROUTES } from './application-detail/application-detail-routes';

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
    },
    // each tab within the page navigates to a separate route
    // e.g. /a/:id/(overview|authorizations|compliance|docs)
    children: TAB_NAV_ROUTES
  },
  {
    path: 'a/:appId/edit',
    component: ApplicationAddEditComponent,
    resolve: {
      application: ApplicationDetailResolver
    }
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
