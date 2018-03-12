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
import { ApplicationAsideComponent } from './application-aside/application-aside.component';
import { ApplicationAddEditComponent } from './application-add-edit/application-add-edit.component';
import { SelectOrganizationComponent } from './select-organization/select-organization.component';

// services
import { ApiService } from '../services/api';
import { ApplicationService } from '../services/application.service';

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
    ApplicationAsideComponent,
    ApplicationAddEditComponent
  ],
  exports: [
    ApplicationListComponent,
    ApplicationDetailComponent,
    ApplicationAsideComponent,
    ApplicationAddEditComponent
  ],
  providers: [
    ApiService,
    ApplicationService
  ],
  entryComponents: [
    SelectOrganizationComponent
  ]
})
export class ApplicationsModule { }
