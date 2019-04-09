import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { Document } from 'app/models/document';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';
import { ApiService } from 'app/services/api';
import { SearchService } from 'app/services/search.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { PlatformLocation } from '@angular/common';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { DocumentTableRowsComponent } from './project-document-table-rows/project-document-table-rows.component';
import { SearchTerms, SearchResults } from 'app/models/search';
import { ConfirmComponent } from 'app/confirm/confirm.component';

@Component({
  selector: 'app-project-documents',
  templateUrl: './project-documents.component.html',
  styleUrls: ['./project-documents.component.scss']
})
export class ProjectDocumentsComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public documents: Document[] = null;
  public loading = true;

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: 'col-1'
    },
    {
      name: 'Name',
      value: 'documentFileName',
      width: 'col-7'
    },
    {
      name: 'Date',
      value: 'date',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'documentType',
      width: 'col-1'
    },
    {
      name: 'Size',
      value: 'documentFileSize',
      width: 'col-1'
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

  public currentProjectId = '';

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

    this.route.parent.paramMap
    .takeUntil(this.ngUnsubscribe)
    .subscribe(paramMap => {
      this.currentProjectId = paramMap.get('projId');

      this.route.data
        .takeUntil(this.ngUnsubscribe)
        .subscribe((res: any) => {
          if (res) {
            this.loading = false;
            if (res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
              this.totalCount = res.documents[0].data.meta[0].searchResultsTotal;
              this.documents = res.documents[0].data.searchResults;
            } else {
              this.totalCount = 0;
              this.documents = [];
            }
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
    });
  }

  public checkChange(event) {
  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'selectAll':
        this.documentTableData.data.map((item) => {
          item.checkbox = true;
        });
        this._changeDetectionRef.detectChanges();
      break;
      case 'edit':
        let selectedDocs = [];
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            selectedDocs.push(this.documents.filter(d => d._id === item._id)[0]);
          }
        });
        // Store and send to the edit page.
        this.storageService.state.selectedDocs = selectedDocs;
        // Set labels if doc size === 1
        if (selectedDocs.length === 1) {
          this.storageService.state.labels = selectedDocs[0].labels;
        }
        this.router.navigate(['p', this.currentProjectId, 'project-documents', 'edit']);
      break;
    case 'delete':
        this.deleteDocument();
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
    }
  }

  deleteDocument() {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete Document',
        message: 'Click <strong>OK</strong> to delete this Document or <strong>Cancel</strong> to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            // Delete the Document(s)
            let itemsToDelete = [];
            this.documentTableData.data.map((item) => {
              if (item.checkbox === true) {
                itemsToDelete.push( { promise: this.documentService.delete(item).toPromise(), item: item });
              }
            });

            return Promise.all(itemsToDelete).then(() => {
              // Reload main page.
              this.onSubmit();
            });
          }
        }
      );
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
    console.log('nav:', ['p', this.currentProjectId, 'project-documents', params]);
    this.router.navigate(['p', this.currentProjectId, 'project-documents', params]);
  }

  setDocumentRowData() {
    let documentList = [];
    if (this.documents && this.documents.length > 0) {
      this.documents.forEach(document => {
        documentList.push(
          {
            // displayName: document.displayName || document.internalOriginalName,
            // date: document.dateUploaded || document.datePosted,
            documentFileName: document.documentFileName,
            date: document.dateUploaded,
            documentType: document.documentType,
            documentFileSize: document.documentFileSize,
            _id: document._id,
            project: document.project
          }
        );
      });
      this.documentTableData = new TableObject(
        DocumentTableRowsComponent,
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
                                        'Document',
                                        [{ 'name': 'project', 'value': this.currentProjectId }],
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
