import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';

export interface MapLoaderOptions {
  mapProperties?: __esri.MapProperties;
  webMapProperties?: __esri.WebMapProperties;
  mapViewProperties?: __esri.MapViewProperties;
  mapEl?: ElementRef;
}

@Injectable()
export class MapLoaderService {
  isLoaded = new EventEmitter();
  map: __esri.Map;
  mapView: __esri.MapView;

  constructor(private esriLoader: EsriLoaderService) { }

  load(options: MapLoaderOptions = {}): Promise<{ map: __esri.Map, mapView: __esri.MapView }> {
    // destructuring assignment; this creates new variables "mapProperties", "webMapProperties", etc.
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const { mapProperties, webMapProperties, mapViewProperties, mapEl } = options;

    // determine if loading a WebMap or creating a custom map
    if (mapProperties) {
      return this.loadMap(mapProperties, mapViewProperties, mapEl);
    } else if (webMapProperties) {
      return this.loadWebMap(webMapProperties, mapViewProperties, mapEl);
    }

    return Promise.reject(new Error('Proper map properties were not provided'));
  }

  private loadMap(mapProperties: __esri.MapProperties,
    mapViewProperties: __esri.MapViewProperties,
    mapEl: ElementRef): Promise<{ map: __esri.Map, mapView: __esri.MapView }> {
    // only load the ArcGIS API for JavaScript when this component is loaded
    return this.loadArcgis()
      // load the needed Map and MapView modules from the JSAPI
      .then(() => this.esriLoader.loadModules(['esri/Map', 'esri/views/MapView']))
      .then(([Map, MapView]: [__esri.MapConstructor, __esri.MapViewConstructor]) => {
        // create a Map instance
        const map = new Map(mapProperties);

        // create a MapView instance (for 2D viewing)
        const mapView = new MapView({
          ...mapViewProperties,
          container: mapEl.nativeElement,  // References a DOM element
          map: map,  // References a Map instance
        });

        // an instance of MapView is also a Promise. Call the .then() method on the MapView instance
        // to execute processes that may only run after the map has loaded.
        return mapView.then(() => {
          this.map = map;
          this.mapView = mapView;

          this.isLoaded.emit();

          return {
            map: map,
            mapView: mapView
          };
        }).otherwise((error) => {
          console.log('The map view failed to load: ', error);
        });
      });
  }

  private loadWebMap(webMapProperties: __esri.WebMapProperties,
    mapViewProperties: __esri.MapViewProperties,
    mapEl: ElementRef): Promise<{ map: __esri.Map, mapView: __esri.MapView }> {
    // only load the ArcGIS API for JavaScript when this component is loaded
    return this.loadArcgis()
      // load the needed WebMap and MapView modules from the JSAPI
      .then(() => this.esriLoader.loadModules(['esri/WebMap', 'esri/views/MapView']))
      .then(([WebMap, MapView]: [__esri.WebMapConstructor, __esri.MapViewConstructor]) => {
        // create a WebMap instance
        const webmap = new WebMap(webMapProperties);

        // create a MapView instance (for 2D viewing)
        const mapView = new MapView({
          ...mapViewProperties,
          container: mapEl.nativeElement,  // References a DOM element
          map: webmap,  // the WebMap instance created above
        });

        // an instance of MapView is also a Promise. Call the .then() method on the MapView instance
        // to execute processes that may only run after the map has loaded.
        return mapView.then(() => {
          this.map = webmap;
          this.mapView = mapView;

          this.isLoaded.emit();

          return {
            map: webmap,
            mapView: mapView
          };
        }).otherwise((error) => {
          console.log('The map view failed to load: ', error);
        });
      });
  }

  private loadArcgis(): Promise<Function> {
    return this.esriLoader.load({
      // use a specific version of the API instead of the latest
      url: 'https://js.arcgis.com/4.5/'
    });
  }
}
