import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material';

import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { PublishedPipe } from 'app/pipes/published.pipe';
import { ObjectFilterPipe } from 'app/pipes/object-filter.pipe';
import { VarDirective } from 'app/utils/ng-var.directive';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';

@NgModule({
  imports: [
    BrowserModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    ObjectFilterPipe,
    VarDirective,
    FileUploadComponent
  ],
  exports: [
    MatSlideToggleModule,
    MatSnackBarModule,
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    VarDirective,
    FileUploadComponent
  ]
})

export class SharedModule { }
