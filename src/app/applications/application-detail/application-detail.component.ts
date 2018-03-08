import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment-timezone';
import * as L from 'leaflet';
import * as _ from 'lodash';
import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {
  public application: Application;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  fg: L.FeatureGroup;
  map: L.Map;
  layers: L.Layer[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService, // also used in template
    public applicationService: ApplicationService, // used in template
    private searchService: SearchService,
    private commentPeriodService: CommentPeriodService, // used in template
  ) { }

  ngOnInit(): void {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return; // return false;
    }

    // get data directly from resolver
    this.application = this.route.snapshot.data.application;
    console.log('application =', this.application); // FOR DEBUGGING

    // application not found --> navigate back to application list
    if (!this.application || !this.application._id) {
      alert('Uh-oh, application not found');
      this.router.navigate(['/applications']);
    }

    const self = this;
    this.searchService.getByDTID(this.application.tantalisID.toString()).subscribe(
      features => {
        self.map = L.map('map').setView([53.505, -127.09], 6);
        console.log("map");
        const World_Topo_Map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; and the GIS User Community'
        }).addTo(self.map);

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
          // const content = '<h3>' + featureObj.properties.TENURE_TYPE
          //   + '<br />'
          //   + featureObj.properties.TENURE_SUBTYPE + '</h3>'
          //   + '<strong>ShapeID: </strong>' + featureObj.properties.INTRID_SID
          //   + '<br />'
          //   + '<strong>Disposition: </strong>' + featureObj.properties.DISPOSITION_TRANSACTION_SID
          //   + '<br />'
          //   + '<strong>Purpose: </strong>' + featureObj.properties.TENURE_PURPOSE
          //   + '<br />'
          //   + '<strong>Sub Purpose: </strong>' + featureObj.properties.TENURE_SUBPURPOSE
          //   + '<br />'
          //   + '<strong>Stage: </strong>' + featureObj.properties.TENURE_STAGE
          //   + '<br />'
          //   + '<strong>Status: </strong>' + featureObj.properties.TENURE_STATUS
          //   + '<br />'
          //   + '<strong>Hectares: </strong>' + featureObj.properties.TENURE_AREA_IN_HECTARES
          //   + '<br />'
          //   + '<br />'
          //   + '<strong>Legal Description: </strong>' + featureObj.properties.TENURE_LEGAL_DESCRIPTION;
          // const popup = L.popup(options).setContent(content);
          // layer.bindPopup(popup);
          self.fg.addLayer(layer);
          layer.addTo(self.map);
        });

        self.map.fitBounds(self.fg.getBounds());
      },
      error => {
        console.log("Error:");
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public launchMap(): void {
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }
  public gotoMap(): void {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it.
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }

  getDaysRemaining(): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = moment(this.application.currentPeriod.endDate).diff(moment(today), 'days') + 1;
    return (days === 1) ? (days + ' Day Remaining') : (days + ' Days Remaining');
  }

  getPendingComments(): string {
    let count: number;
    count = 123;
    return count.toString();
  }
}
