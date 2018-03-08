import { Component, OnInit, OnDestroy, ElementRef, ViewChild, EventEmitter, Input, Output } from '@angular/core';

import { MapLoaderService } from '../map-loader.service';

/* tslint:disable:component-selector */
@Component({
  selector: 'esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.scss']
})
/* tslint:enable:component-selector */
export class EsriMapComponent implements OnInit, OnDestroy {
  // public properties
  map: __esri.Map;
  mapView: __esri.MapView;

  // create the MapView at the DOM element in this component
  @ViewChild('map') mapEl: ElementRef;

  @Input() mapProperties: __esri.MapProperties;
  @Input() webMapProperties: __esri.WebMapProperties;
  @Input() mapViewProperties: __esri.MapViewProperties = {};
  @Input() suppressPopupActions = false;
  @Input() staticMap = false;

  @Output() mapInit = new EventEmitter();

  // private fields
  private subs: IHandle[];

  constructor(private mapLoader: MapLoaderService) { }

  ngOnInit() {
    if (this.map) {
      // map is already initialized
      return;
    }

    this.loadMap();
  }

  ngOnDestroy() {
    // dispose the resources held by event handlers (if any)
    (this.subs || []).forEach(sub => sub.remove());
    this.subs = null;
  }

  loadMap(): Promise<any> {
    const options = {
      mapProperties: this.mapProperties,
      webMapProperties: this.webMapProperties,
      mapViewProperties: this.mapViewProperties,
      mapEl: this.mapEl
    };

    // suppress default popup actions; i.e. 'zoom-to'
    if (this.suppressPopupActions) {
      options.mapViewProperties = { ...options.mapViewProperties, popup: { actions: [] } };
    }

    // exclude the zoom widget from the default UI
    if (this.staticMap) {
      options.mapViewProperties = { ...options.mapViewProperties, ui: { components: ['attribution'] } };
    }

    return this.mapLoader.load(options)
      .then(mapInfo => {
        this.map = mapInfo.map;
        this.mapView = mapInfo.mapView;

        // static maps have no panning or zooming
        if (this.staticMap) {
          this.disableMapNavigation(this.mapView);
        }

        // emit event informing application that the map has been loaded
        this.mapInit.emit({
          map: this.map,
          mapView: this.mapView
        });
        this.mapInit.complete();
      });
  }

  /**
   * Disables all zoom and panning gestures on the given view instance.
   * @private
   * @param view The MapView instance on which to disable zooming and panning gestures.
   */
  private disableMapNavigation(view: __esri.MapView): __esri.MapView {
    // stops propagation of default behavior when an event fires
    const stopEventPropagation = (evt: { stopPropagation: Function; }) => evt.stopPropagation();

    // removes the zoom action on the popup
    view.popup.actions.removeAll();

    this.subs = [
      // disable map click
      view.on('click', stopEventPropagation),
      // disable mouse wheel scroll zooming on the view
      view.on('mouse-wheel', stopEventPropagation),
      // disable zooming via double-click on the view
      view.on('double-click', stopEventPropagation),
      // disable zooming out via double-click + Control on the view
      view.on('double-click', ['Control'], stopEventPropagation),
      // disable pinch-zoom and panning on the view
      view.on('drag', stopEventPropagation),
      // disable the view's zoom box to prevent the Shift + drag
      // and Shift + Control + drag zoom gestures.
      view.on('drag', ['Shift'], stopEventPropagation),
      view.on('drag', ['Shift', 'Control'], stopEventPropagation),
      // prevent zooming with the +/- keys
      view.on('key-down', stopEventPropagation)
    ];

    return view;
  }
}
