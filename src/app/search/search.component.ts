import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import { SearchService } from 'app/services/search.service';
import { SearchTerms } from 'app/models/search';
import { Application } from 'app/models/application';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  public searching = false;
  public ranSearch = false;
  public keywords: string[] = [];
  public applications: Application[] = [];
  public count = 0; // for template
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe = new Subject<boolean>();

  constructor(
    public snackBar: MatSnackBar,
    public searchService: SearchService, // also used in template
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // get search terms from route
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
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
    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private doSearch() {
    this.searching = true;
    this.count = 0;
    this.keywords = (this.terms.keywords && _.uniq(_.compact(this.terms.keywords.split(' ')))) || []; // safety checks
    this.applications.length = 0; // empty the list

    this.searchService
      .getAppsByClidDtid(this.keywords)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        applications => {
          applications.forEach(application => {
            // add if not already in list
            if (!_.find(this.applications, app => app.tantalisID === application.tantalisID)) {
              this.applications.push(application);
            }
          });
          this.count = this.applications.length;
        },
        error => {
          console.log('error =', error);

          // update variables on error
          this.searching = false;
          this.ranSearch = true;

          this.snackBarRef = this.snackBar.open('Error searching applications ...', 'RETRY');
          this.snackBarRef.onAction().subscribe(() => this.onSubmit());
        },
        () => {
          // onCompleted
          // update variables on completion
          this.searching = false;
          this.ranSearch = true;
        }
      );
  }

  // reload page with current search terms
  public onSubmit() {
    // dismiss any open snackbar
    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();

    // console.log('params =', params);
    this.router.navigate(['search', params]);
  }

  public onImport(application: Application) {
    if (application) {
      // save application data from search results
      const params = {
        // initial data
        purpose: application.purpose,
        subpurpose: application.subpurpose,
        type: application.type,
        subtype: application.subtype,
        status: application.status,
        tenureStage: application.tenureStage,
        location: application.location,
        businessUnit: application.businessUnit,
        cl_file: application.cl_file,
        tantalisID: application.tantalisID,
        legalDescription: application.legalDescription,
        client: application.client,
        statusHistoryEffectiveDate: application.statusHistoryEffectiveDate
      };
      // go to add-edit page
      this.router.navigate(['/a', 0, 'edit'], { queryParams: params });
    } else {
      console.log('error, invalid application =', application);
      this.snackBarRef = this.snackBar.open('Error creating application ...', null, { duration: 3000 });
    }
  }
}
