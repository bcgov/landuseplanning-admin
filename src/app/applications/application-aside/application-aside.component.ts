import { Component, OnInit, OnChanges, OnDestroy, Input, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ConfigService } from 'app/services/config.service';
import { FeatureService } from 'app/services/feature.service';

@Component({
  selector: 'app-application-aside',
  templateUrl: './application-aside.component.html',
  styleUrls: ['./application-aside.component.scss']
})
export class ApplicationAsideComponent implements OnInit, OnChanges, OnDestroy {
  @Input() application: Application = null;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public fg: L.FeatureGroup;
  public map: L.Map;
  public layers: L.Layer[];
  private maxZoom = { maxZoom: 17 };

  constructor(public configService: ConfigService, private featureService: FeatureService) {}

  ngOnInit() {
    const World_Topo_Map = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom: 16,
        noWrap: true
      }
    );
    const World_Imagery = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 17,
        noWrap: true
      }
    );
    const Esri_OceanBasemap = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 13,
        noWrap: true
      }
    );
    const Esri_NatGeoWorldMap = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
        maxZoom: 16,
        noWrap: true
      }
    );

    this.map = L.map('map', {
      zoomControl: false // will be added manually below
    });

    // add zoom control
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // add scale control
    L.control.scale({ position: 'bottomright' }).addTo(this.map);

    // add base maps layers control
    const baseLayers = {
      'Ocean Base': Esri_OceanBasemap,
      'Nat Geo World Map': Esri_NatGeoWorldMap,
      'World Topographic': World_Topo_Map,
      'World Imagery': World_Imagery
    };
    L.control.layers(baseLayers, null, { collapsed: true }).addTo(this.map);

    // load base layer
    for (const key of Object.keys(baseLayers)) {
      if (key === this.configService.baseLayerName) {
        this.map.addLayer(baseLayers[key]);
        break;
      }
    }

    // save any future base layer changes
    this.map.on(
      'baselayerchange',
      function(e: L.LayersControlEvent) {
        this.configService.baseLayerName = e.name;
      },
      this
    );

    // reset view control
    const resetViewControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: map => {
        const element = L.DomUtil.create('i', 'material-icons leaflet-bar leaflet-control leaflet-control-custom');
        element.title = 'Reset view';
        element.innerText = 'refresh';
        element.style.width = '34px';
        element.style.height = '34px';
        element.style.lineHeight = '30px';
        element.style.textAlign = 'center';
        element.style.cursor = 'pointer';
        element.style.backgroundColor = '#fff';
        element.onmouseover = () => (element.style.backgroundColor = '#f4f4f4');
        element.onmouseout = () => (element.style.backgroundColor = '#fff');

        element.onclick = () => {
          const bounds = this.fg.getBounds();
          if (bounds && bounds.isValid()) {
            this.map.fitBounds(bounds, this.maxZoom);
          }
        };
        map.getPanes().overlayPane.appendChild(element);
        return element;
      },
      onRemove: function(map) {
        map.getPanes().overlayPane.removeChild(this.element);
      }
    });
    this.map.addControl(new resetViewControl());

    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges) {
    // guard against null application
    if (changes.application.currentValue) {
      this.updateData();
    }
  }

  private updateData() {
    if (this.application) {
      if (this.fg) {
        _.each(this.layers, layer => {
          this.map.removeLayer(layer);
        });
        this.fg.clearLayers();
      } else {
        this.fg = L.featureGroup();
      }

      // NB: always reload results to reduce chance of race condition
      //     with drawing map and features
      this.featureService
        .getByApplicationId(this.application._id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          features => {
            try {
              _.each(features, feature => {
                const f = JSON.parse(JSON.stringify(feature));
                // needs to be valid GeoJSON
                delete f.geometry_name;
                const featureObj: GeoJSON.Feature<any> = f;
                const layer = L.geoJSON(featureObj);
                this.fg.addLayer(layer);
                layer.addTo(this.map);
              });

              const bounds = this.fg.getBounds();
              if (bounds && bounds.isValid()) {
                this.map.fitBounds(bounds, this.maxZoom);
              }
            } catch (e) {}
          },
          error => console.log('error =', error)
        );
    }
  }

  // called from parent component
  public drawMap(app: Application) {
    if (app.tantalisID) {
      this.featureService
        .getByTantalisId(app.tantalisID)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          features => {
            if (this.fg) {
              _.each(this.layers, layer => {
                this.map.removeLayer(layer);
              });
              this.fg.clearLayers();
            }

            _.each(features, function(feature) {
              const f = JSON.parse(JSON.stringify(feature));
              // needs to be valid GeoJSON
              delete f.geometry_name;
              const featureObj: GeoJSON.Feature<any> = f;
              const layer = L.geoJSON(featureObj);
              this.fg.addLayer(layer);
              layer.addTo(this.map);
            });

            const bounds = this.fg.getBounds();
            if (bounds && bounds.isValid()) {
              this.map.fitBounds(bounds, this.maxZoom);
            }
          },
          error => console.log('error =', error)
        );
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
