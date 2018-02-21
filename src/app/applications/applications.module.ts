import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

// modules
import { SharedModule } from '../shared/shared.module';
import { ApplicationsRoutingModule } from './applications-routing.module';
import { MapModule } from '../map/map.module';

// components
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { DocumentsTabContentComponent } from './application-detail/documents/documents-tab-content.component';

// services
import { ApiService } from '../services/api';
// import { DocumentService } from '../services/document.service';
import { ApplicationService } from '../services/application.service';
import { ApplicationAddEditComponent } from './application-add-edit/application-add-edit.component';
import { SelectOrganizationComponent } from './select-organization/select-organization.component';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    SharedModule,
    ApplicationsRoutingModule,
    MapModule,
    FormsModule
  ],
  declarations: [
    ApplicationListComponent,
    ApplicationDetailComponent,
    DocumentsTabContentComponent,
    ApplicationAddEditComponent
  ],
  exports: [
    ApplicationListComponent,
    ApplicationDetailComponent
  ],
  providers: [
    ApiService,
    // DocumentService,
    ApplicationService
  ],
  entryComponents: [
    SelectOrganizationComponent
  ]
})
export class ApplicationsModule { }
