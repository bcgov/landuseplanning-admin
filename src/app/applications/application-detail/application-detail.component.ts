import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment-timezone';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {
  public application: Application = null;
  private daysRemaining = '?';
  private numComments = '?';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  fg: L.FeatureGroup;
  map: L.Map;
  layers: L.Layer[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService, // also used in template
    private applicationService: ApplicationService, // used in template
    private searchService: SearchService,
    private commentPeriodService: CommentPeriodService, // used in template
    private commentService: CommentService
  ) { }

  ngOnInit() {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            this.application = data.application;

            //
            // TODO: create separate component for aside items
            //       which can be used here and in application-detail
            //

            // get comment period days remaining
            if (this.application.currentPeriod) {
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const days = moment(this.application.currentPeriod.endDate).diff(moment(today), 'days') + 1;
              this.daysRemaining = days + (days === 1 ? ' Day ' : ' Days ') + 'Remaining';
            }

            // get number of pending comments
            this.commentService.getAllByApplicationId(this.application._id)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                (comments: Comment[]) => {
                  const pending = comments.filter(comment => this.commentService.isPending(comment));
                  const count = pending.length;
                  this.numComments = count.toString();
                },
                error => console.log('couldn\'t get pending comments, error =', error)
              );

            const self = this;
            this.searchService.getByDTID(this.application.tantalisID.toString()).subscribe(
              features => {
                self.map = L.map('map').setView([53.505, -127.09], 6);
                console.log('map');
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

                const bounds = self.fg.getBounds();
                if (!_.isEmpty(bounds)) {
                  self.map.fitBounds(bounds);
                }
              },
              error => {
                console.log('error =', error);
              });
          } else {
            // application not found --> navigate back to application list
            alert('Uh-oh, couldn\'t load application');
            this.router.navigate(['/applications']);
          }
        },
        error => {
          console.log(error);
          alert('Uh-oh, couldn\'t load application');
          this.router.navigate(['/applications']);
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public launchMap() {
    const appId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: appId }]);
  }

  public gotoMap() {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it.
    const appId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: appId }]);
  }
}
