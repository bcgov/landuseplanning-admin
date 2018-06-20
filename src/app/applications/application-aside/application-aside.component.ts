import { Component, OnChanges, OnDestroy, Input, SimpleChanges } from '@angular/core';
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
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-application-aside',
  templateUrl: './application-aside.component.html',
  styleUrls: ['./application-aside.component.scss']
})

export class ApplicationAsideComponent implements OnChanges, OnDestroy {
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
    private searchService: SearchService,
    public commentPeriodService: CommentPeriodService, // used in template
    private commentService: CommentService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    // console.log('changes.application =', changes.application);

    // guard against null application
    if (changes.application.currentValue) {
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

      if (this.application._id !== '0' && this.application.tantalisID) {
        const self = this;
        const resetViewControl = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            const element = L.DomUtil.create('i', 'material-icons leaflet-bar leaflet-control leaflet-control-custom');
            element.title = 'Reset view';
            element.innerText = 'refresh';
            element.style.width = '34px';
            element.style.height = '34px';
            element.style.lineHeight = '30px';
            element.style.textAlign = 'center';
            element.style.cursor = 'pointer';
            element.style.backgroundColor = '#fff';
            element.onmouseover = () => element.style.backgroundColor = '#f4f4f4';
            element.onmouseout = () => element.style.backgroundColor = '#fff';
            element.onclick = function () {
              const bounds = self.fg.getBounds();
              if (bounds && bounds.isValid()) {
                self.map.fitBounds(bounds, self.maxZoom);
              }
            };
            return element;
          },
        });

        // NB: always reload results to reduce chance of race condition
        //     with drawing map and features
        this.searchService.getByDTID(this.application.tantalisID)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            features => {
              const World_Topo_Map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
              });
              const World_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              });
              const OpenMapSurfer_Roads = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
                maxZoom: 20,
                attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              });
              const Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
                maxZoom: 13
              });
              const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
                maxZoom: 16
              });

              try {
                self.map = L.map('map', {
                  layers: [World_Imagery]
                });

                // set up the controls
                self.baseMaps = {
                  'Ocean Base': Esri_OceanBasemap,
                  'Nat Geo World Map': Esri_NatGeoWorldMap,
                  'Open Surfer Roads': OpenMapSurfer_Roads,
                  'World Topographic': World_Topo_Map,
                  'World Imagery': World_Imagery
                };
                self.control = L.control.layers(self.baseMaps, null, { collapsed: true }).addTo(self.map);
                self.map.addControl(new resetViewControl());

                if (self.fg) {
                  _.each(self.layers, function (layer) {
                    self.map.removeLayer(layer);
                  });
                  self.fg.clearLayers();
                } else {
                  self.fg = L.featureGroup();
                }

                _.each(features, function (feature) {
                  const f = JSON.parse(JSON.stringify(feature));
                  // Needed to be valid GeoJSON
                  delete f.geometry_name;
                  const featureObj: GeoJSON.Feature<any> = f;
                  const layer = L.geoJSON(featureObj);
                  const options = { maxWidth: 400 };
                  self.fg.addLayer(layer);
                  layer.addTo(self.map);
                });

                const bounds = self.fg.getBounds();
                if (bounds && bounds.isValid()) {
                  self.map.fitBounds(bounds, self.maxZoom);
                }
              } catch (e) { }
            },
            error => {
              console.log('error =', error);
            }
          );
      }
    }
  }

  // called from parent component
  public drawMap(app: Application) {
    if (app._id !== '0' && app.tantalisID) {
      const self = this;
      this.searchService.getByDTID(app.tantalisID)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          features => {
            if (self.fg) {
              _.each(self.layers, function (layer) {
                self.map.removeLayer(layer);
              });
              self.fg.clearLayers();
            }
            _.each(features, function (feature) {
              const f = JSON.parse(JSON.stringify(feature));
              // Needed to be valid GeoJSON
              delete f.geometry_name;
              const featureObj: GeoJSON.Feature<any> = f;
              const layer = L.geoJSON(featureObj);
              const options = { maxWidth: 400 };
              self.fg.addLayer(layer);
              layer.addTo(self.map);
            });

            const bounds = self.fg.getBounds();
            if (bounds && bounds.isValid()) {
              self.map.fitBounds(bounds, self.maxZoom);
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
