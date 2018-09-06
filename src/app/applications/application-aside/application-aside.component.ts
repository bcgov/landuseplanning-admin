import { Component, OnInit, OnChanges, OnDestroy, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { ApiService } from 'app/services/api';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';
import { FeatureService } from 'app/services/feature.service';

@Component({
  selector: 'app-application-aside',
  templateUrl: './application-aside.component.html',
  styleUrls: ['./application-aside.component.scss']
})

export class ApplicationAsideComponent implements OnInit, OnChanges, OnDestroy {
  @Input() application: Application = null;
  public daysRemaining = '-';
  public numComments = '-';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public fg: L.FeatureGroup;
  public map: L.Map;
  public layers: L.Layer[];
  private baseMaps: {};
  private control: L.Control;
  private maxZoom = { maxZoom: 17 };

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private featureService: FeatureService,
    public commentPeriodService: CommentPeriodService, // used in template
    private commentService: CommentService
  ) { }

  ngOnInit() {
    const World_Topo_Map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      maxZoom: 16,
      noWrap: true
    });
    const World_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 17,
      noWrap: true
    });
    const OpenMapSurfer_Roads = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
      attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
      noWrap: true
    });
    const Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
      maxZoom: 13,
      noWrap: true
    });
    const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
      maxZoom: 16,
      noWrap: true
    });

    this.map = L.map('map', {
      layers: [World_Imagery]
    });

    // set up the controls
    this.baseMaps = {
      'Ocean Base': Esri_OceanBasemap,
      'Nat Geo World Map': Esri_NatGeoWorldMap,
      'Open Surfer Roads': OpenMapSurfer_Roads,
      'World Topographic': World_Topo_Map,
      'World Imagery': World_Imagery
    };
    this.control = L.control.layers(this.baseMaps, null, { collapsed: true }).addTo(this.map);
    const resetViewControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function (map) {
        this._map = map;
        this._element = L.DomUtil.create('i', 'material-icons leaflet-bar leaflet-control leaflet-control-custom');
        this._element.title = 'Reset view';
        this._element.innerText = 'refresh';
        this._element.style.width = '34px';
        this._element.style.height = '34px';
        this._element.style.lineHeight = '30px';
        this._element.style.textAlign = 'center';
        this._element.style.cursor = 'pointer';
        this._element.style.backgroundColor = '#fff';
        this._element.onmouseover = () => this._element.style.backgroundColor = '#f4f4f4';
        this._element.onmouseout = () => this._element.style.backgroundColor = '#fff';

        const self = this; // for closure function below
        this._element.onclick = function () {
          const bounds = self.fg.getBounds();
          if (bounds && bounds.isValid()) {
            self.map.fitBounds(bounds, self.maxZoom);
          }
        };
        map.getPanes().overlayPane.appendChild(this._element);
        return this._element;
      },
      onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._element);
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
      // get comment period days remaining
      if (this.application._id !== '0' && this.application.currentPeriod) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // use moment to handle Daylight Saving Time changes
        const days = moment(this.application.currentPeriod.endDate).diff(moment(today), 'days') + 1;
        this.daysRemaining = days + (days === 1 ? ' Day ' : ' Days ') + 'Remaining';
      }

      // get number of pending comments
      if (this.application._id !== '0') {
        this.commentService.getAllByApplicationId(this.application._id)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (comments: Comment[]) => {
              const pending = comments.filter(comment => this.commentService.isPending(comment));
              this.numComments = pending.length.toString();
            },
            error => console.log('couldn\'t get pending comments, error =', error)
          );
      }

      const self = this; // for closure functions below

      if (this.fg) {
        _.each(this.layers, function (layer) {
          self.map.removeLayer(layer);
        });
        this.fg.clearLayers();
      } else {
        this.fg = L.featureGroup();
      }

      // NB: always reload results to reduce chance of race condition
      //     with drawing map and features
      this.featureService.getByApplicationId(this.application._id)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          features => {
            try {
              _.each(features, function (feature) {
                const f = JSON.parse(JSON.stringify(feature));
                // needs to be valid GeoJSON
                delete f.geometry_name;
                const featureObj: GeoJSON.Feature<any> = f;
                const layer = L.geoJSON(featureObj);
                const options = { maxWidth: 400 };
                self.fg.addLayer(layer);
                layer.addTo(self.map);
              });

              const bounds = this.fg.getBounds();
              if (bounds && bounds.isValid()) {
                this.map.fitBounds(bounds, this.maxZoom);
              }
            } catch (e) { }
          },
          error => {
            console.log('error =', error);
          }
        );
    }
  }

  // called from parent component
  public drawMap(app: Application) {
    if (app.tantalisID) {
      const self = this;
      this.featureService.getByDTID(app.tantalisID)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          features => {
            if (self.fg) {
              _.each(self.layers, function (layer) {
                self.map.removeLayer(layer);
              });
              this.fg.clearLayers();
            }

            _.each(features, function (feature) {
              const f = JSON.parse(JSON.stringify(feature));
              // needs to be valid GeoJSON
              delete f.geometry_name;
              const featureObj: GeoJSON.Feature<any> = f;
              const layer = L.geoJSON(featureObj);
              const options = { maxWidth: 400 };
              self.fg.addLayer(layer);
              layer.addTo(self.map);
            });

            const bounds = this.fg.getBounds();
            if (bounds && bounds.isValid()) {
              this.map.fitBounds(bounds, this.maxZoom);
            }
          },
          error => {
            console.log('error =', error);
          }
        );
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
