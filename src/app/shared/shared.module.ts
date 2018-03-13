import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
// import { MatProgressBarModule } from '@angular/material';

import { OrderByPipe } from '../pipes/order-by.pipe';
import { NewlinesPipe } from '../pipes/newlines.pipe';
import { PublishedPipe } from '../pipes/published.pipe';
import { ObjectFilterPipe } from 'app/pipes/object-filter.pipe';

import { FileUploadComponent } from 'app/file-upload/file-upload.component';

@NgModule({
  imports: [
    // CommonModule,
    BrowserModule,
    // MatProgressBarModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    ObjectFilterPipe,
    FileUploadComponent
  ],
  exports: [
    OrderByPipe,
    NewlinesPipe,
    PublishedPipe,
    FileUploadComponent
  ]
})

export class SharedModule { }
