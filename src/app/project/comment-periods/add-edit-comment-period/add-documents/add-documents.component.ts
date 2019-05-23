import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { Document } from 'app/models/document';
import { SearchTerms } from 'app/models/search';

import { ApiService } from 'app/services/api';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

import { AddDocumentTableRowsComponent } from './add-document-table-rows/add-document-table-rows.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
  selector: 'app-add-documents',
  templateUrl: './add-documents.component.html',
  styleUrls: ['./add-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddDocumentComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public documents: Document[] = null;
  public loading = true;

  public isEditing = false;

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Name',
      value: 'displayName',
      width: 'col-6'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-2'
    },
    {
      name: 'Milestone',
      value: 'milestone',
      width: 'col-2'
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

  public currentProject;
  public currentCommentPeriod;
  public originalSelectedDocs = [];

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService,
    private location: PlatformLocation,
    private platformLocation: PlatformLocation,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    public storageService: StorageService
  ) {
    this.location.onPopState(() => {
      // TODO: if navigating anywhere, we should ask the user if they really want to do that.
      this.storageService.state.selectedDocumentsForCP.data = this.originalSelectedDocs;
    });
  }

  ngOnInit() {
    // BUG: If you refresh while adding comment period, the page does not show up.
    let isRedirecting = false;

    this.currentProject = this.storageService.state.currentProject.data;

    // Check if we're editing
    this.route.url.subscribe(segments => {
      segments.forEach(segment => {
        if (segment.path === 'edit') {
          this.isEditing = true;
          if (this.storageService.state.currentCommentPeriod == null) {
            let commentPeriodId;
            isRedirecting = true;
            this.route.parent.params.subscribe(params => {
              commentPeriodId = params.commentPeriodId;
            });
            this.router.navigate(['/p', this.currentProject._id, 'cp', commentPeriodId, 'edit']);
            this.loading = false;
          }
          this.currentCommentPeriod = this.storageService.state.currentCommentPeriod.data;
        }
      });
    });

    if (!isRedirecting) {
      // get data from route resolver
      this.route.params
        .takeUntil(this.ngUnsubscribe)
        .subscribe(params => {
          this.keywords = params.keywords;
        });

      this.originalSelectedDocs = Object.assign([], this.storageService.state.selectedDocumentsForCP.data);

      this.route.data
        .takeUntil(this.ngUnsubscribe)
        .subscribe((res: any) => {
          if (res) {
            if (res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
              this.totalCount = res.documents[0].data.meta[0].searchResultsTotal;
              this.documents = res.documents[0].data.searchResults;
            } else {
              this.totalCount = 0;
              this.documents = [];
            }
            this.loading = false;
            this.setDocumentRowData();
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load valued components');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
            this.loading = false;
          }
        }
        );
    }

  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'copyLink':
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            let selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            selBox.value = window.location.href.split(';')[0] + `/detail/${item._id}`;
            document.body.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            document.body.removeChild(selBox);
          }
        });
        break;
      case 'selectAll':
        let someSelected = false;
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
        });

        this.documentTableData.data.map((item) => {
          item.checkbox = !someSelected;
          if (item.checkbox) {
            this.storageService.state.selectedDocumentsForCP.data.push(item);
          } else {
            this.storageService.state.selectedDocumentsForCP.data = this.storageService.state.selectedDocumentsForCP.data.filter(obj => obj._id !== item._id);
          }
        });

        this.selectedCount = someSelected ? 0 : this.documentTableData.data.length;
        this._changeDetectionRef.detectChanges();
        break;
      case 'download':
        let promises = [];
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            promises.push(this.api.downloadDocument(this.documents.filter(d => d._id === item._id)[0]));
          }
        });
        return Promise.all(promises).then(() => {
          console.log('Download initiated for file(s)');
        });
        break;
      case 'copyLink':
        break;
      case 'submitDocs':
        if (this.isEditing) {
          this.router.navigate(['/p', this.currentProject._id, 'cp', this.currentCommentPeriod._id, 'edit']);
        } else {
          this.router.navigate(['/p', this.currentProject._id, 'comment-periods', 'add']);
        }
        break;
    }
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
    console.log('nav:', ['p', this.currentProject._id, 'comment-periods', 'add', 'add-documents', params]);
    this.router.navigate(['p', this.currentProject._id, 'comment-periods', 'add', 'add-documents', params]);
  }

  setDocumentRowData() {
    let documentList = [];
    if (this.documents && this.documents.length > 0) {
      this.documents.forEach(document => {
        documentList.push(
          {
            displayName: document.displayName,
            datePosted: document.datePosted,
            type: document.type,
            milestone: document.milestone,
            _id: document._id,
            project: document.project,
            documentFileName: document.documentFileName
          }
        );
      });
      this.documentTableData = new TableObject(
        AddDocumentTableRowsComponent,
        documentList,
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

  isEnabled(button) {
    switch (button) {
      case 'copyLink':
        return this.selectedCount === 1;
        break;
      default:
        return this.selectedCount > 0;
        break;
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  getPaginatedDocs(pageNumber, sortBy, sortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    if (sortBy === undefined || sortBy === null) {
      sortBy = this.sortBy;
      sortDirection = this.sortDirection;
    }

    let sorting = null;
    if (sortBy) {
      sorting = (sortDirection > 0 ? '+' : '-') + sortBy;
    }

    this.searchService.getSearchResults(this.keywords,
      'Document',
      [{ 'name': 'project', 'value': this.currentProject._id }],
      pageNumber,
      this.pageSize,
      sorting,
      '[documentSource]=PROJECT')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.currentPage = pageNumber;
        this.sortBy = sortBy;
        this.sortDirection = this.sortDirection;
        this.updateUrl(sorting);
        this.totalCount = res[0].data.meta[0].searchResultsTotal;
        this.documents = res[0].data.searchResults;
        this.setDocumentRowData();
        this.loading = false;
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

  removeSelectedDoc(doc) {
    this.storageService.state.selectedDocumentsForCP.data = this.storageService.state.selectedDocumentsForCP.data.filter(obj => obj._id !== doc._id);
    this.documentTableData.data.map((item) => {
      if (item._id === doc._id) {
        item.checkbox = false;
      }
    });
  }

  clearSelectedDocs(navigation) {
    if (confirm('Are you sure you want to leave the page. All selected documents will be lost.')) {
      this.storageService.state.selectedDocumentsForCP.data = this.originalSelectedDocs;
      this.router.navigate(navigation);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
