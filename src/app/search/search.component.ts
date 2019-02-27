import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { SearchService } from 'app/services/search.service';
import { SearchTerms, SearchResults } from 'app/models/search';
import { Project } from 'app/models/project';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  public searching = false;
  public ranSearch = false;
  public keywords: string;
  public count = 0; // for template
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe = new Subject<boolean>();

  public projects: Array<any> = [];
  public documents: Array<any> = [];
  public vcs: Array<any> = [];

  constructor(
    public snackBar: MatSnackBar,
    public searchService: SearchService, // also used in template
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // TODO: when clicking on radio buttons, url must change to reflect dataset.

  ngOnInit() {
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
          // default all
          this.terms.dataset = 'All';
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

  handleRadioChange(value) {
    this.terms.dataset = value;
    this.onSubmit();
  }

  private doSearch() {
    this.projects = [];
    this.documents = [];
    this.vcs = [];

    this.searching = true;
    this.count = 0;
    this.keywords = this.terms.keywords;

    this.searchService.getSearchResults(this.keywords, this.terms.dataset)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        results => {
          this.count = results.length;
          results.forEach(result => {
            switch (result.data['_schemaName']) {
              case 'Project': {
                this.projects.push(result.data);
                break;
              }
              case 'Document': {
                this.documents.push(result.data);
                break;
              }
              case 'Vc': {
                this.vcs.push(result.data);
                break;
              }
              default: {
                break;
              }
            }
          });
        },
        error => {
          console.log('error =', error);

          // update variables on error
          this.searching = false;
          this.ranSearch = true;

          this.snackBarRef = this.snackBar.open('Error searching projects ...', 'RETRY');
          this.snackBarRef.onAction().subscribe(() => this.onSubmit());
        },
        () => { // onCompleted
          // update variables on completion
          this.searching = false;
          this.ranSearch = true;
        });
  }

  // reload page with current search terms
  public onSubmit() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;

    // console.log('params =', params);
    this.router.navigate(['search', params]);
  }

  public onImport(project: Project) {
    if (project) {
      // save project data from search results
      const params = {
        // initial data
        // purpose: project.purpose,
        // subpurpose: project.subpurpose,
        // type: project.type,
        // subtype: project.subtype,
        // status: project.status,
        // tenureStage: project.tenureStage,
        // location: project.location,
        // businessUnit: project.businessUnit,
        // cl_file: project.cl_file,
        // tantalisID: project.tantalisID,
        // legalDescription: project.legalDescription,
        // client: project.client
      };
      // go to add-edit page
      this.router.navigate(['/a', 0, 'edit'], { queryParams: params });
    } else {
      console.log('error, invalid project =', project);
      this.snackBarRef = this.snackBar.open('Error creating project ...', null, { duration: 3000 });
    }
  }

}
