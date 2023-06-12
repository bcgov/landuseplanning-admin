// Modules.
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProjectsRoutingModule } from './projects-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Providers.
import { ShapeFileResolver } from './add-edit-project/project-shapefile-resolver.services';

// Components.
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectListTableRowsComponent } from './project-list/project-list-table-rows/project-list-table-rows.component';
import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    NgxPaginationModule,
    ProjectsRoutingModule,
    SharedModule,
    CKEditorModule,
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  declarations: [
    AddEditProjectComponent,
    ProjectListComponent,
    ProjectListTableRowsComponent
  ],
  exports: [
    ProjectListComponent
  ],
  providers: [
    ShapeFileResolver
  ]
})

export class ProjectsModule { }
