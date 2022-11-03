import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { SearchTerms } from 'app/models/search';

import { StorageService } from 'app/services/storage.service';

import { ContactSelectTableRowsComponent } from './contact-select-table-rows/contact-select-table-rows.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { User } from 'app/models/user';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

@Component({
  selector: 'app-contact-select',
  templateUrl: './contact-select.component.html',
  styleUrls: ['./contact-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSelectComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public users: User[] = null;
  public loading = true;

  public isEditing = false;

  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: 'Name',
      value: 'displayName',
      width: 'col-4'
    },
    {
      name: 'Phone',
      value: 'phoneNumber',
      width: 'col-4'
    },
    {
      name: 'Email',
      value: 'email',
      width: 'col-4'
    }
  ];

  public navigationObject;
  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();
  public contactId = '';
  public isParentCompany = false;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    public storageService: StorageService,
    public navigationStackUtils: NavigationStackUtils,
    public tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();/*
      if (this.navigationObject.breadcrumbs[0].label === 'Contacts' || this.navigationObject.breadcrumbs[this.navigationObject.breadcrumbs.length - 1].label === 'Add Contact') {
        this.isParentCompany = true;
      }*/
    } else {
      // TODO: determine where to boot out.
      this.router.navigate(['/']);
    }

    // get data from route resolver
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        if (params.contactId) {
          this.contactId = params.contactId;
          this.isEditing = true;
        }
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 15);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '+name';
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
      });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          if (res.users[0].data.meta && res.users[0].data.meta.length > 0) {
            this.tableParams.totalListItems = res.users[0].data.meta[0].searchResultsTotal;
            this.users = res.users[0].data.searchResults;
          } else {
            this.tableParams.totalListItems = 0;
            this.users = [];
          }
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  public onSubmit(currentPage = 1) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['currentPage'] = currentPage;
    params['sortBy'] = this.tableParams.sortBy;
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize;

    if (this.isEditing) {
      this.router.navigate(['c', this.contactId, 'edit', 'contact-select', params]);
    } else {
      this.router.navigate(['contacts', 'add', 'contact-select', params]);
    }
  }

  setRowData() {
    let dataList = [];
    if (this.users && this.users.length > 0) {
      this.users.forEach(user => {
        dataList.push(
          {
            name: user.displayName,
            organization: user.org,
            phone: user.phoneNumber,
            email: user.email,
            _id: user._id,
            isEditing: this.isEditing,
            contactId: this.contactId
          }
        );
      });
      this.tableData = new TableObject(
        ContactSelectTableRowsComponent,
        dataList,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
  }

  createContact() {
    this.setBreadcrumbs();
    this.router.navigate(['/contacts', 'add']);
  }

  private setBreadcrumbs() {
    let nextBackUrl = [...this.navigationObject.backUrl];
    nextBackUrl.push('contact-select');
    let nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
    nextBreadcrumbs.push(
      {
        route: nextBackUrl,
        label: 'Select Contact'
      }
    );
    this.navigationStackUtils.pushNavigationStack(
      nextBackUrl,
      nextBreadcrumbs
    );
  }

  goBack() {
    let url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
