import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { User } from 'app/models/user';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { UserTableRowsComponent } from './user-table-rows/user-table-rows.component';
import { SearchTerms } from 'app/models/search';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { StorageService } from 'app/services/storage.service';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

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
      width: 'col-4'
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
    },
    {
      name: 'Action',
      value: 'null',
      width: 'col-1',
      nosort: true
    }
  ];

  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private navigationStackUtils: NavigationStackUtils,
    private tableTemplateUtils: TableTemplateUtils,
    private storageService: StorageService
  ) { }

  /**
   * Set up contacts table entries with data from API.
   *
   * @return {void}
   */
  ngOnInit(): void {
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        this.route.data
          .takeUntil(this.ngUnsubscribe)
          .subscribe((res: any) => {
            if (res && res.users && res.users[0].data.meta && res.users[0].data.meta.length > 0) {
              this.tableParams.totalListItems = res.users[0].data.meta[0].searchResultsTotal;
              this.users = res.users[0].data.searchResults;
            } else {
              this.tableParams.totalListItems = 0;
              this.users = [];
            }
            this.setDocumentRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          });
      });
  }

  /**
   * Submit handler for a search of the contacts table.
   *
   * @param {number} currentPage Current page value used for paginated search results.
   * @return {void}
   */
  public onSubmit(currentPage: number = 1): void {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = currentPage;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    params['sortBy'] = this.tableParams.sortBy;

    this.router.navigate(['contacts', params]);
  }

  /**
   * Set document table data.
   *
   * @return {void}
   */
  setDocumentRowData(): void {
    if (this.users && this.users.length > 0) {
      const list = [...this.users];
      this.documentTableData = new TableObject(
        UserTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  /**
   * Update the table params when sorting by a given value(column).
   *
   * @param {string} column The column to sort by.
   * @return {void}
   */
  setColumnSort(column: string): void {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
  }

  /**
   * Set the selected count.
   *
   * @param {number} count The count to set.
   * @return {void}
   */
  updateSelectedRow(count: number): void {
    this.selectedCount = count;
  }

  /**
   * Clear the current contact from the storage service, then clear the navigation
   * stack and send the user to the add new contact page.
   *
   * @return {void}
   */
  addContact(): void {
    this.storageService.state.contactForm = null;
    this.storageService.state.selectedOrganization = null;
    this.navigationStackUtils.clearNavigationStack();
    this.router.navigate(['contacts', 'add']);
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
