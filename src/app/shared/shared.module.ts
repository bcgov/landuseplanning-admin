import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { NewlinesPipe } from 'app/shared/pipes/newlines.pipe';
import { PublishedPipe } from 'app/shared/pipes/published.pipe';
import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { ScrollListenDirective } from 'app/shared/utils/scroll-listen.directive';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';
import { TableTemplateComponent } from 'app/shared/components/table-template/table-template.component';
import { NgxPaginationModule } from 'ngx-pagination';

import { TableDirective } from './components/table-template/table.directive';
import { DropdownTemplateComponent } from './components/dropdown-template/dropdown-template.component';
import { TableTemplateUtils } from './utils/table-template-utils';
import { CommentStatsComponent } from './components/comment-stats/comment-stats.component';
import { ListConverterPipe } from './pipes/list-converter.pipe';
import { CamelToStringPipe } from './pipes/camel-to-string.pipe';
import { Utils } from './utils/utils';
//import { ContactSelectComponent } from './components/contact-select/contact-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <== add the imports!
import { RouterModule } from '@angular/router';
import { LinkOrganizationComponent } from './components/link-organization/link-organization.component';
import { LinkOrganizationTableRowsComponent } from './components/link-organization/link-organization-table-rows/link-organization-table-rows.component';
import { ContactSelectComponent } from './components/contact-select/contact-select.component';
import { ContactSelectTableRowsComponent } from './components/contact-select/contact-select-table-rows/contact-select-table-rows.component';
import { NavigationStackUtils } from './utils/navigation-stack-utils';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule
  ],
  declarations: [
    CommentStatsComponent,
    ContactSelectComponent,
    DropdownTemplateComponent,
    FileUploadComponent,
    LinkOrganizationComponent,
    LinkOrganizationTableRowsComponent,
    ContactSelectComponent,
    ContactSelectTableRowsComponent,
    ListConverterPipe,
    NewlinesPipe,
    PublishedPipe,
    CamelToStringPipe,
    TableDirective,
    TableTemplateComponent,
    VarDirective,
    ScrollListenDirective
  ],
  exports: [
    CommentStatsComponent,
    ContactSelectComponent,
    DropdownTemplateComponent,
    FileUploadComponent,
    LinkOrganizationComponent,
    LinkOrganizationTableRowsComponent,
    ContactSelectComponent,
    ContactSelectTableRowsComponent,
    ListConverterPipe,
    MatSlideToggleModule,
    MatSnackBarModule,
    NewlinesPipe,
    NgxPaginationModule,
    CamelToStringPipe,
    PublishedPipe,
    TableTemplateComponent,
    VarDirective,
    ScrollListenDirective
  ],
  providers: [
    TableTemplateUtils,
    NavigationStackUtils,
    Utils
  ]
})

export class SharedModule { }
