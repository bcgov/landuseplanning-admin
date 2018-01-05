import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';
import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { DocumentService } from '../services/document.service';
import { Project } from '../models/project';
import { Search, SearchTerms } from '../models/search';
import { Proponent } from '../models/proponent';
import { ProjectService } from '../services/project.service';
import { ProponentService } from '../services/proponent.service';
import { SearchService } from '../services/search.service';
import { Api } from '../services/api';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({opacity: 1}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({opacity: 0}))
      ])
    ])
  ]
})

export class SearchComponent implements OnInit {
  results: Search;
  page: number;
  limit: number;
  count: number;
  noMoreResults: boolean;
  ranSearch: boolean;
  projects: Array<Project>;
  proponents: Array<Proponent>;
  projectArray: Array<string>;
  protoSearchActive: boolean;
  showAdvancedFields: boolean;
  public loading: boolean;

  params: Params;
  terms: SearchTerms;

  myProjects: Array<any>;

  constructor(calender: NgbCalendar,
              private documentService: DocumentService,
              private projectService: ProjectService,
              private proponentService: ProponentService,
              private searchService: SearchService,
              private _changeDetectionRef: ChangeDetectorRef,
              private router: Router,
              private route: ActivatedRoute,
              private api: Api) {
    this.limit = 15;
  }

  ngOnInit() {
    this.noMoreResults      = true;
    this.ranSearch          = false;
    this.showAdvancedFields = false;
    this.loading            = false;

    this.route.params.subscribe((params: Params) => {
      /*
        TBD: Deal with meta search terms?
          this.params.type
          this.params.page
          this.params.limit
      */
      this.params = params;
      this.terms  = new SearchTerms();

      if (this.params.clfiles) {
        this.terms.clfiles = this.params.clfiles.split(',').join(' ');
      }

      this._changeDetectionRef.detectChanges();

      if (!_.isEmpty(this.terms.getParams())) {
        this.doSearch(true);
      }
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

    this.searchService.getByCLFile(this.terms.clfiles).subscribe(
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
      error => console.log(error)
    );
  }

  onSubmit() {
    this.router.navigate(['search', this.terms.getParams()]);
  }

  loadMore() {
    this.doSearch(false);
  }
}
