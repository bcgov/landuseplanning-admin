import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectListComponent } from './project-list/project-list.component';
import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';
import { ProjectListResolver } from './project-list/project-list-resolver.services';
import { LinkOrganizationComponent } from 'app/shared/components/link-organization/link-organization.component';
import { LinkOrganizationResolver } from 'app/shared/components/link-organization/link-organization-resolver.services';
import { ContactSelectComponent } from 'app/shared/components/contact-select/contact-select.component';
import { ContactSelectResolver } from 'app/shared/components/contact-select/contact-select-resolver.services';

const routes: Routes = [
  {
    path: 'projects/add/link-org',
    component: LinkOrganizationComponent,
    resolve: {
      organizations: LinkOrganizationResolver
    }
  },
  {
    path: 'projects/add/contact-select',
    component: ContactSelectComponent,
    resolve: {
      users: ContactSelectResolver
    }
  },
  {
    path: 'projects/add',
    component: AddEditProjectComponent
  },
  {
    path: 'projects',
    component: ProjectListComponent,
    resolve: {
      projects: ProjectListResolver
    }
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
    ProjectListResolver,
    LinkOrganizationResolver,
    ContactSelectResolver
  ]
})

export class ProjectsRoutingModule { }
