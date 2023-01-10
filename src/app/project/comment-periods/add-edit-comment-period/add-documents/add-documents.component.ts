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
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { encode } from 'punycode';

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
  ];

  public currentProject;
  public currentCommentPeriod;
  public originalSelectedDocs = [];
  public selectedCount = 0;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService,
    private location: PlatformLocation,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    public storageService: StorageService,
    public tableTemplateUtils: TableTemplateUtils
  ) {
    this.location.onPopState(() => {
      // TODO: if navigating anywhere, we should ask the user if they really want to do that.
      this.storageService.state.selectedDocumentsForCP.data = this.originalSelectedDocs;
    });
  }

  /**
   * Get the current project from local storage. Check the URL: if the user
   * is trying to edit a comment period, and there's no current comment period,
   * redirect the user to the comment period edit page.
   *
   * Then, if not redirecting, get the table params and documents from the
   * route resolver.
   *
   * @todo Investigate possible bug: If you refresh while adding comment period, the page does not show up.
   * @return {void}
   */
  ngOnInit() {
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
          this.tableParams.keywords = params.keywords;
        });

      this.originalSelectedDocs = Object.assign([], this.storageService.state.selectedDocumentsForCP.data);

      this.route.data
        .takeUntil(this.ngUnsubscribe)
        .subscribe((res: any) => {
          if (res) {
            if (res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
              this.tableParams.totalListItems = res.documents[0].data.meta[0].searchResultsTotal;
              this.documents = res.documents[0].data.searchResults;
            } else {
              this.tableParams.totalListItems = 0;
              this.documents = [];
            }
            this.setDocumentRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load valued components');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        });
    }
  }

  /**
   * Handle various actions for modifying/working with documents(files).
   * This includes, copying their links, selecting, downloading.
   *
   * @param {string} action The document action to take.
   * @returns {void}
   */
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
        return Promise.all(promises);
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

  /**
   * Submit a document(file). Reset the table params and navigate the user to
   * the appropriate destination based on their editing status or not.
   *
   * @return {void}
   */
  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    // Reset page.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '';
    params['keywords'] = encode(this.tableParams.keywords = this.tableParams.keywords || '').replace(/\(/g, '%28').replace(/\)/g, '%29');
    params['pageSize'] = this.tableParams.pageSize = 10;

    if (this.isEditing) {
      this.router.navigate(['p', this.currentProject._id, 'cp', this.currentCommentPeriod._id, 'edit', 'add-documents', params]);
    } else {
      this.router.navigate(['p', this.currentProject._id, 'comment-periods', 'add', 'add-documents', params]);
    }
  }

  /**
   * Set the document(file) row data, update the TableObject with
   * the document data.
   *
   * @return {void}
   */
  setDocumentRowData() {
    let documentList = [];
    if (this.documents && this.documents.length > 0) {
      this.documents.forEach(document => {
        documentList.push(
          {
            displayName: document.displayName,
            datePosted: document.datePosted,
            _id: document._id,
            project: document.project,
            documentFileName: document.documentFileName
          }
        );
      });
      this.documentTableData = new TableObject(
        AddDocumentTableRowsComponent,
        documentList,
        this.tableParams
      );
    }
  }

  /**
   * When the user sorts the table by column, update the table params
   * with the sort type and direction(+,-), then get a list of documents(files)
   * sorted accordingly.
   *
   * @param {string} column What value to sort by.
   * @return {void}
   */
  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  /**
   * Enables the copy link button if there is a selected document.
   *
   * @param {string} button The button to enable.
   * @returns {void}
   */
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

  /**
   * Set the selected count.
   *
   * @param {number} count The count to set.
   * @return {void}
   */
  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  /**
   * Load a "page" of documents.
   *
   * @param {number} pageNumber The page number of documents to get.
   * @return {void}
   */
  getPaginatedDocs(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.searchService.getSearchResults(
      this.tableParams.keywords || '',
      'Document',
      [{ 'name': 'project', 'value': this.currentProject._id }],
      pageNumber,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      { documentSource: 'PROJECT' })
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.documents = res[0].data.searchResults;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords || '');
        this.setDocumentRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  /**
   * Remove a selected document(file) from local storage, and un-check the checkbox
   * on the selected document.
   *
   * @param {Document} doc The document to de-select.
   * @return {void}
   */
  removeSelectedDoc(doc) {
    this.storageService.state.selectedDocumentsForCP.data = this.storageService.state.selectedDocumentsForCP.data.filter(obj => obj._id !== doc._id);
    this.documentTableData.data.map((item) => {
      if (item._id === doc._id) {
        item.checkbox = false;
      }
    });
  }

  /**
   * When the user wants to exit the page, remove selected documents from local
   * storage and navigate away.
   *
   * @param {any[]} navigation The commands to pass to the router to navigate with.
   * @return {void}
   */
  clearSelectedDocs(navigation) {
    if (confirm('Are you sure you want to leave the page. All selected documents will be lost.')) {
      this.storageService.state.selectedDocumentsForCP.data = this.originalSelectedDocs;
      this.router.navigate(navigation);
    }
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
