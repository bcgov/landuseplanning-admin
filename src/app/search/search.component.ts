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
