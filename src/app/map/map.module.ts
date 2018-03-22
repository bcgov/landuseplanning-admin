import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { EsriMapComponent } from './esri-map/esri-map.component';
import { MainMapComponent } from './main-map/main-map.component';
import { ApplicationMapComponent } from './application-map/application-map.component';
import { MapLoaderService } from './map-loader.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    EsriMapComponent,
    MainMapComponent,
    ApplicationMapComponent
  ],
  exports: [
    EsriMapComponent,
    MainMapComponent,
    ApplicationMapComponent
  ],
  providers: [
    MapLoaderService
  ]
})
export class MapModule { }
