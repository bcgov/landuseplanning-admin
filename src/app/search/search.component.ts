import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { SearchTerms } from 'app/models/search';
import { ApplicationService } from 'app/services/application.service';
import { SearchService } from 'app/services/search.service';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  public searching = false;
  public ranSearch = false;
  public keywords: Array<string> = [];
  public groupByResults: Array<any> = [];
  public count = 0; // for template
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe = new Subject<boolean>();

  constructor(
    public snackBar: MatSnackBar,
    private applicationService: ApplicationService,
    private searchService: SearchService,
    private router: Router,
    private route: ActivatedRoute,
    private _changeDetectionRef: ChangeDetectorRef,
    // private authenticationService: AuthenticationService,
    private api: ApiService
  ) { }

  ngOnInit() {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      this.router.navigate(['/login']);
    }
    // get search terms from route
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        if (params.keywords) {
          // remove empty and duplicate items
          this.terms.keywords = _.uniq(_.compact(params.keywords.split(','))).join(' ');
        }

        if (!_.isEmpty(this.terms.getParams())) {
          this.doSearch();
        }
      });
  }

  ngOnDestroy() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private doSearch() {
    this.searching = true;
    this.keywords = this.terms.keywords && _.uniq(_.compact(this.terms.keywords.split(' '))) || []; // safety checks
    this.groupByResults.length = 0; // empty the list

    this.searchService.getByClidDtid(this.keywords, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        search => {
          // console.log('search =', search);
          if (search.totalFeatures > 0 && search.features && search.features.length > 0) {
            const groupedFeatures = _.groupBy(search.features, 'properties.DISPOSITION_TRANSACTION_SID');
            const self = this; // for closure below
            _.each(groupedFeatures, function (value: any, key: string) {
              // ensure result is not already in list
              if (!_.find(self.groupByResults, result => { return result.properties.DISPOSITION_TRANSACTION_SID === +key; })) {
                // if app is in PRC, query application data to update UI
                if (_.includes(search.sidsFound, key)) {
                  value[0].loaded = false;
                  self.applicationService.getByTantalisID(+key, true)
                    .takeUntil(self.ngUnsubscribe)
                    .subscribe(
                      application => {
                        value[0].loaded = true;
                        if (application) {
                          value[0].app = application;
                          // Force change detection since we changed a bound property after the normal check cycle and outside anything
                          // that would trigger a CD cycle - this will eliminate the error we get when running in dev mode.
                          self._changeDetectionRef.detectChanges();
                        }
                      },
                      error => {
                        self.snackBarRef = self.snackBar.open('Error retrieving application ...', null, { duration: 3000 });
                      }
                    );
                } else {
                  value[0].loaded = true;
                }
                self.groupByResults.push(value[0]);
              }
            });
          }
        },
        error => {
          // update variables on error
          this.searching = false;
          this.ranSearch = true;
          this.count = 0;
          this._changeDetectionRef.detectChanges(); // force change detection

          this.snackBarRef = this.snackBar.open('Error searching applications ...', 'RETRY');
          this.snackBarRef.onAction().subscribe(() => this.onSubmit());
        },
        () => {
          // update variables on completion
          this.searching = false;
          this.ranSearch = true;
          this.count = this.groupByResults.length;
          this._changeDetectionRef.detectChanges(); // force change detection
        });
  }

  // reload page with current search terms
  public onSubmit() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // ref: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    const params = this.terms.getParams();
    params['now'] = Date.now();

    // console.log('params =', params);
    this.router.navigate(['search', params]);
  }

  public importProject(item: any) {
    // save application properties from search results
    if (item.properties) {
      // cached data
      item.purpose = item.properties.TENURE_PURPOSE;
      item.subpurpose = item.properties.TENURE_SUBPURPOSE;
      item.type = item.properties.TENURE_TYPE;
      item.subtype = item.properties.TENURE_SUBTYPE;
      item.status = this.applicationService.getStatusCode(item.properties.TENURE_STATUS);
      item.tenureStage = item.properties.TENURE_STAGE;
      item.location = item.properties.TENURE_LOCATION;
      item.businessUnit = item.properties.RESPONSIBLE_BUSINESS_UNIT;
      item.region = this.applicationService.getRegionCode(item.businessUnit);
      // these are special - we will persist them to db as search keys
      item.cl_file = +item.properties.CROWN_LANDS_FILE; // NOTE: unary operator
      item.tantalisID = item.properties.DISPOSITION_TRANSACTION_SID;
    }

    // add the application
    // on success go to edit page
    this.applicationService.add(item)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(application => {
        this.router.navigate(['/a', application._id, 'edit']);
      });
  }
}
