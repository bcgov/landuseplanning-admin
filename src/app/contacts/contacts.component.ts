import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { User } from 'app/models/user';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';
import { ApiService } from 'app/services/api';
import { SearchService } from 'app/services/search.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { PlatformLocation } from '@angular/common';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { UserTableRowsComponent } from './user-table-rows/user-table-rows.component';
import { SearchTerms, SearchResults } from 'app/models/search';
import { ConfirmComponent } from 'app/confirm/confirm.component';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public users: User[] = null;
  public loading = true;

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: 'Name',
      value: 'displayName',
      width: 'col-3'
    },
    {
      name: 'Organization',
      value: 'org',
      width: 'col-3'
    },
    {
      name: 'Phone',
      value: 'phoneNumber',
      width: 'col-3'
    },
    {
      name: 'Email',
      value: 'email',
      width: 'col-3'
    }
  ];

  public pageNum = 0;
  public sortBy = '';
  public sortDirection = 0;
  public pageSize = 10;
  public currentPage = 1;
  public totalCount = 0;
  public selectedCount = 0;
  public keywords = '';

  constructor(
    private route: ActivatedRoute,
    private platformLocation: PlatformLocation,
    private dialogService: DialogService,
    private router: Router,
    private api: ApiService,
    private documentService: DocumentService,
    private searchService: SearchService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.params
    .takeUntil(this.ngUnsubscribe)
    .subscribe(params => {
      this.keywords = params.keywords;
    });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.loading = false;
        if (res && res.users && res.users[0].data.meta && res.users[0].data.meta.length > 0) {
          this.totalCount = res.users[0].data.meta[0].searchResultsTotal;
          this.users = res.users[0].data.searchResults;
        } else {
          this.totalCount = 0;
          this.users = [];
        }
        this.setDocumentRowData();
        this._changeDetectionRef.detectChanges();
      }
    );
  }

  public checkChange(event) {
  }

  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    // Reset page.
    this.currentPage = 1;
    this.sortBy = '';
    this.sortDirection = 0;

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.terms.currentPage;
    params['sortBy'] = this.terms.sortBy;
    params['sortDirection'] = this.terms.sortDirection;

    console.log('params =', params);
    console.log('nav:', ['u', params]);
    this.router.navigate(['u', params]);
  }

  setDocumentRowData() {
    if (this.users && this.users.length > 0) {
      const list = [...this.users];
      this.documentTableData = new TableObject(
        UserTableRowsComponent,
        list,
        {
          pageSize: this.pageSize,
          currentPage: this.currentPage,
          totalListItems: this.totalCount,
          sortBy: this.sortBy,
          sortDirection: this.sortDirection
          }
      );
    }
  }

  setColumnSort(column) {
    this.sortBy = column;
    this.sortDirection = this.sortDirection > 0 ? -1 : 1;
    this.getPaginatedDocs(this.currentPage, this.sortBy, this.sortDirection);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  getPaginatedDocs(pageNumber, sortBy, sortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    console.log(pageNumber, sortBy, sortDirection);


    if (sortBy === undefined || sortBy === null) {
      sortBy = this.sortBy;
      sortDirection = this.sortDirection;
    }

    let sorting = null;
    if (sortBy) {
      sorting = (sortDirection > 0 ? '+' : '-') + sortBy;
    }

    console.log('sorting', sorting);
    console.log('pageNumber', pageNumber);

    this.loading = true;
    this.searchService.getSearchResults(this.keywords,
                                        'User',
                                        null,
                                        pageNumber,
                                        this.pageSize,
                                        sorting,
                                        null)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.currentPage = pageNumber;
        this.sortBy = sortBy;
        this.sortDirection = this.sortDirection;
        this.updateUrl(sorting);
        this.totalCount = res[0].data.meta[0].searchResultsTotal;
        this.users = res[0].data.searchResults;
        this.loading = false;
        this.setDocumentRowData();
        this._changeDetectionRef.detectChanges();
      });
  }

  updateUrl(sorting) {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split(';')[0];
    currentUrl += `;currentPage=${this.currentPage};pageSize=${this.pageSize}`;
    currentUrl += `;sortBy=${sorting}`;
    currentUrl += ';ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
