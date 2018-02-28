import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';
import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
// import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

import { DocumentService } from '../services/document.service';
import { Application } from '../models/application';
import { Search, SearchTerms } from '../models/search';
import { Proponent } from '../models/proponent';
import { ApplicationService } from '../services/application.service';
import { ProponentService } from '../services/proponent.service';
import { SearchService } from '../services/search.service';
// import { ApiService } from '../services/api';
import * as L from 'leaflet';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import { AppComponent } from 'app/app.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class SearchComponent implements OnInit, OnDestroy {
  results: Search;
  page: number;
  limit: number;
  count: number;
  noMoreResults: boolean;
  ranSearch: boolean;
  applications: Array<Application>;
  proponents: Array<Proponent>;
  applicationArray: Array<string>;
  protoSearchActive: boolean;
  showAdvancedFields: boolean;
  public loading: boolean;
  params: Params;
  terms: SearchTerms;
  myApplications: Array<any>;
  map: L.Map;
  fg: L.FeatureGroup;
  layers: L.Layer[];
  tileLayers: L.TileLayer[];
  baseMaps: {};
  control: L.Control;
  private sub: Subscription;

  constructor(
    // calendar: NgbCalendar,
    private documentService: DocumentService,
    private applicationService: ApplicationService,
    private proponentService: ProponentService,
    private searchService: SearchService,
    // private api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.limit = 15;
  }

  ngOnInit() {
    this.noMoreResults = true;
    this.ranSearch = false;
    this.showAdvancedFields = false;
    this.loading = false;

    if (!this.tileLayers) {
      this.tileLayers = [];
    }
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
    this.map = L.map('map', {
      layers: [Esri_NatGeoWorldMap, World_Topo_Map, OpenMapSurfer_Roads, Esri_OceanBasemap, World_Imagery]
    });

    // Setup the controls
    this.baseMaps = {
      'Ocean Base': Esri_OceanBasemap,
      'Nat Geo World Map': Esri_NatGeoWorldMap,
      'Open Surfer Roads': OpenMapSurfer_Roads,
      'World Imagery': World_Imagery,
      'World Topographic': World_Topo_Map
    };

    if (!this.layers) {
      this.layers = [];
    }

    this.sub = this.route.params.subscribe(
      (params: Params) => {
        /*
          TBD: Deal with meta search terms?
            this.params.type
            this.params.page
            this.params.limit
        */
        this.params = params;
        this.terms = new SearchTerms();

        if (this.params.clfile) {
          this.terms.clfile = this.params.clfile.split(',').join(' ');
        }

        this._changeDetectionRef.detectChanges();

        if (!_.isEmpty(this.terms.getParams())) {
          this.doSearch(true);
        }
      }
    );
  }

   ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  importProject(item: any) {
    // console.log('IMPORT:', item);

    // Call the API and create the project, upon success redirect to the edit.
    this.applicationService.addApplication(item)
    .subscribe(application => {
      // console.log('ADDED:', application._id);
      this.router.navigate(['a/', application._id]);
    });
  }

  toggleAdvancedSearch() {
    this.showAdvancedFields = !this.showAdvancedFields;
  }

  doSearch(firstSearch: boolean) {
    this.loading = true;
    this.ranSearch = true;

    if (firstSearch) {
      this.page = 0;
      this.count = 0;
      this.results = null;
      this.noMoreResults = false;
    } else {
      this.page += 1;
    }

    this.searchService.getByCLFile(this.terms.clfile)
      // .finally(() => this.loading = false) // TODO: make this work
      .subscribe(
      data => {
        this.loading = false;
        // This outputs the value of data to the web console.
        this.results = data;
        const self = this;

        // Create the FG for all the layers in this search.
        if (self.fg) {
          // console.log('clearing');
          self.map.removeControl(self.control);
          _.each(self.layers, function (layer) {
            self.map.removeLayer(layer);
          });
          self.fg.clearLayers();
          // console.log('self.fg', self.fg);
        } else {
          self.fg = L.featureGroup();
        }
        const overlayMaps: {[k: string]: any} = {};

        _.each(this.results.features, function (feature) {
          const f = JSON.parse(JSON.stringify(feature));
          delete f.geometry_name;
          const featureObj: GeoJSON.Feature<any> = f;
          const layer = L.geoJSON(featureObj);
          self.layers.push(layer);
          console.log('props:', featureObj.properties);
          const options = {maxWidth: 400};
          const content = '<h3>' + featureObj.properties.TENURE_TYPE
                          + '<br />'
                          + featureObj.properties.TENURE_SUBTYPE + '</h3>'
                          + '<strong>ShapeID: </strong>' + featureObj.properties.INTRID_SID
                          + '<br />'
                          + '<strong>Disposition: </strong>' + featureObj.properties.DISPOSITION_TRANSACTION_SID
                          + '<br />'
                          + '<strong>Purpose: </strong>' + featureObj.properties.TENURE_PURPOSE
                          + '<br />'
                          + '<strong>Sub Purpose: </strong>' + featureObj.properties.TENURE_SUBPURPOSE
                          + '<br />'
                          + '<strong>Stage: </strong>' + featureObj.properties.TENURE_STAGE
                          + '<br />'
                          + '<strong>Status: </strong>' + featureObj.properties.TENURE_STATUS
                          + '<br />'
                          + '<strong>Hectares: </strong>' + featureObj.properties.TENURE_AREA_IN_HECTARES
                          + '<br />'
                          + '<br />'
                          + '<strong>Legal Description: </strong>' + featureObj.properties.TENURE_LEGAL_DESCRIPTION;
          const popup = L.popup(options).setContent(content);
          layer.bindPopup(popup);
          self.fg.addLayer(layer);
          layer.addTo(self.map);
          const st = '<strong>Interest ID:</strong> ' + featureObj.properties.INTRID_SID + '</span>';
          overlayMaps[st] = layer;
        });

        self.control = L.control.layers(self.baseMaps, overlayMaps, { collapsed: false }).addTo(self.map);

        self.map.fitBounds(self.fg.getBounds());

        if (data && data.totalFeatures) {
          this.count = data.totalFeatures;
        }

        // Needed in development mode - not required in prod.
        this._changeDetectionRef.detectChanges();
      },
      error => {
        this.loading = false;
        console.log(error);
      });
  }

  onSubmit() {
    this.router.navigate(['search', this.terms.getParams()]);
  }

  loadMore() {
    this.doSearch(false);
  }

}
