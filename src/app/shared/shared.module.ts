import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
// import { MatProgressBarModule } from '@angular/material';

import { OrderByPipe } from '../pipes/order-by.pipe';
import { NewlinesPipe } from '../pipes/newlines.pipe';

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
    FileUploadComponent
  ],
  exports: [
    OrderByPipe,
    NewlinesPipe,
    FileUploadComponent
  ]
})

export class SharedModule { }
