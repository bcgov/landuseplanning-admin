// modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProjectsRoutingModule } from './projects-routing.module';
import { SharedModule } from 'app/shared/shared.module';

// components
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectListTableRowsComponent } from './project-list/project-list-table-rows/project-list-table-rows.component';
import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    ProjectsRoutingModule,
    SharedModule
  ],
  declarations: [
    ProjectListComponent,
    ProjectListTableRowsComponent,
    AddEditProjectComponent
  ],
  entryComponents: [
    ProjectListTableRowsComponent
  ],
  exports: [
    ProjectListComponent
  ],
  providers: [
  ]
})

export class ProjectsModule { }
