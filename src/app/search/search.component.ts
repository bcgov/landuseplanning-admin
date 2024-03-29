import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { Document } from 'app/models/document';

import { SearchService } from 'app/services/search.service';
import { SearchTerms } from 'app/models/search';
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
  public keywords: string;
  public count = 0; // for template
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe = new Subject<boolean>();
  public currentPage = 1;
  public pageSize = 10;

  public results: Array<any> = [];

  constructor(
    public snackBar: MatSnackBar,
    private _changeDetectionRef: ChangeDetectorRef,
    public api: ApiService,
    public searchService: SearchService, // also used in template
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // TODO: when clicking on radio buttons, url must change to reflect dataset.

  /**
   * Get route query params and convert them into search terms to send to the
   * search API.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    // get search terms from route
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        if (params.keywords) {
          // remove empty and duplicate items
          this.terms.keywords = params.keywords;
        }

        if (params.dataset) {
          this.terms.dataset = params.dataset;
        } else {
          // default documents
          this.terms.dataset = 'Document';
        }

        if (!_.isEmpty(this.terms.getParams())) {
          let cur = params.currentPage ? params.currentPage : 1;
          let size = params.pageSize ? params.pageSize : 25;
          this.doSearch(cur, size);
        }
      });
  }

  /**
   * If the search type radio button changes, change the dataset to
   * search within. Then trigger a search.
   * 
   * @param {string} value The dataset value that's been selected.
   * @return {void}
   */
  handleRadioChange(value: string): void {
    this.terms.dataset = value;
    this.onSubmit();
  }

  /**
   * Fires a search request to the API - querying by keywords, dataset, and
   * passing params for search pagination.
   * 
   * @param {number} pageNumber The page number to search for.
   * @param {number} pageSize The size of the page to search for.
   * @return {void}
   */
  private doSearch(pageNumber: number, pageSize: number): void {
    this.results = [];

    this.searching = true;
    this.count = 0;
    this.keywords = this.terms.keywords;
    this.currentPage = pageNumber;
    this.pageSize = pageSize;

    this.searchService.getSearchResults(this.keywords, this.terms.dataset, null, pageNumber, pageSize, null, {}, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        results => {
          if (results[0].data.meta.length > 0) {
            this.count = results[0].data.meta[0].searchResultsTotal;
            let items = results[0].data.searchResults;
            items.map(item => {
              if (this.terms.dataset === 'Document') {
                this.results.push(new Document(item));
              } else {
                this.results.push(item);
              }
            });
          } else {
            this.count = 0;
            this.results = [];
          }
          this.searching = false;
          this.ranSearch = true;
          this._changeDetectionRef.detectChanges();
        },
        error => {
          console.error(error);

          // update variables on error
          this.searching = false;
          this.ranSearch = true;

          this.snackBarRef = this.snackBar.open('Error searching projects ...', 'RETRY');
          this.snackBarRef.onAction().subscribe(() => this.onSubmit());
        },
        () => {
          // onCompleted
          // update variables on completion
        });
  }

  /**
   * Update the page number for search pagination and submit a new search.
   * Scroll the user to the top of the page.
   * 
   * @param {number} pageNumber The page number to search for.
   * @return {void}
   */
  updatePageNumber(pageNumber: number): void {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.currentPage = pageNumber;
    this.onSubmit();
  }

  /**
   * Reload page with current search terms.
   * 
   * @return {void}
   */
  public onSubmit(): void {
    // dismiss any open snackbar
    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.currentPage ? this.currentPage : 1;
    params['pageSize'] = this.pageSize ? this.pageSize : 10;

    this.router.navigate(['search', params]);
  }

  /**
   * Terminate subscriptions when component is unmounted.
   * Dismiss any open snackbar.
   *
   * @return {void}
   */
  ngOnDestroy(): void {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
