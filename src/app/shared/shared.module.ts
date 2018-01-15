import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { NewlinesPipe } from '../pipes/newlines.pipe';

@NgModule({
  imports: [
    // CommonModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe
  ],
  exports: [
    OrderByPipe,
    NewlinesPipe
  ]
})

export class SharedModule { }
