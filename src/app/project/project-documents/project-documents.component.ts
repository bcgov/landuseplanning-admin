import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavBarButton, PageBreadcrumb } from 'app/shared/components/navbar/types';
import { Document } from 'app/models/document';
import { SearchTerms } from 'app/models/search';
import { isEmpty } from 'lodash'

import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

import { DocumentTableRowsComponent } from './project-document-table-rows/project-document-table-rows.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { NgxSmartModalService } from 'ngx-smart-modal';

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
  public navBarButtons: NavBarButton[];
  public pageBreadcrumbs: PageBreadcrumb[];
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
      width: 'col-5'
    },
    {
      name: 'Size',
      value: 'internalSize',
      width: 'col-1'
    },
    {
      name: 'Type',
      value: 'internalExt',
      width: 'col-1'
    },
    {
      name: 'Status',
      value: 'status',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: 'col-2'
    },
  ];

  public selectedCount = 0;
  public currentProject;
  public canPublish;
  public canUnpublish;
  public pathAPI: string;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService,
    public ngxSmartModalService: NgxSmartModalService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private searchService: SearchService,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) {
    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
    this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;
  }

  /**
   * Load all documents/files for the project. Set the data and params for the
   * table - the UI component used to display documents.
   */
  ngOnInit() {
    if (this.storageService.state.projectDocumentTableParams == null) {
      this.route.params
        .takeUntil(this.ngUnsubscribe)
        .subscribe(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '-datePosted';
          }
          if (params.keywords !== undefined) {
            this.tableParams.keywords = decodeURIComponent(params.keywords) || '';
          } else {
            this.tableParams.keywords = '';
          }
          this.storageService.state.projectDocumentTableParams = this.tableParams;
          this._changeDetectionRef.detectChanges();
        });
    } else {
      this.tableParams = this.storageService.state.projectDocumentTableParams;
      this.tableParams.keywords = decodeURIComponent(this.tableParams.keywords);
    }
    this.currentProject = this.storageService.state.currentProject.data;
    this.storageService.state.labels = null;
    this._changeDetectionRef.detectChanges();

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
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });

    this.ngxSmartModalService.getModal('confirmation-modal').onAnyCloseEventFinished
      .takeUntil(this.ngUnsubscribe)
      .subscribe((modal) => {
      const data = this.ngxSmartModalService.getModalData('confirmation-modal');
      this.documentActions(data);
      });

    this.pageBreadcrumbs = [{ pageTitle: this.currentProject.name, routerLink: [ '/p', this.currentProject._id ]}];
    this.navBarButtons = [{
      label: 'Upload File(s)',
      action: () => this.router.navigate(['p', this.currentProject._id, 'project-files', 'upload'])
    }];
  }

  /**
   * Display the snackbar UI component which shows a message to the user.
   *
   * @param {string} message The message to display in the snackbar.
   * @param {string} action The action to be passed to the snackbar component.
   * @return {void}
   */
  public openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {verticalPosition: 'top', horizontalPosition: 'center', duration: 4000});
  }

  /**
   * Handles the various actions a user can perform to documents
   * (copying their URLs, select all docs, edit, delete, etc.).
   *
   * @param {string} action The action the user has selected.
   */
  public selectAction(action: string): void {
    let promises = [];

    switch (action) {
      case 'copyLink':
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            let selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            const safeName = item.documentFileName.replace(/ /g, '_');
            selBox.value = `${this.pathAPI}/document/${item._id}/fetch/${safeName}`;
            document.body.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            document.body.removeChild(selBox);
            this.openSnackBar('A  PUBLIC  link to this document has been copied.', 'Close');
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
        });

        this.selectedCount = someSelected ? 0 : this.documentTableData.data.length;

        this.toggleCanPublish();

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
        this.router.navigate(['p', this.currentProject._id, 'project-files', 'edit']);
        break;
      case 'delete':
        this.onDeleteDocument();
        break;
      case 'download':
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            promises.push(this.api.downloadDocument(this.documents.filter(d => d._id === item._id)[0]));
          }
        });
        Promise.all(promises).then(() => {
          this.openSnackBar('Download initiated.', 'Close');
        });
      case 'publish':
        this.onPublishDocument();
        break;
      case 'unpublish':
        this.onUnpublishDocument();
        break;
      case 'copyLink':
        break;
    }
  }

  /**
   * Trigger certain actions after a user responds to a modal
   * confirmation message to delete or toggle the published
   * state of a document.
   *
   * @param {object} modalData Data passed back from the modal which tracks the user's response.
   */
  public documentActions(modalData: {publishConfirm?: boolean, deleteConfirm?: boolean, unpublishConfirm?: boolean}): void {
    if (modalData.publishConfirm) {
      this.internalPublishDocument();
    } else if (modalData.deleteConfirm) {
      this.internalDeleteDocument();
    } else if (modalData.unpublishConfirm) {
      this.internalUnpublishDocument();
    } else {
      this.loading = false;
    }
  }

  /**
   * Navigate to the search help page.
   */
  public navSearchHelp(): void {
    this.router.navigate(['/search-help']);
  }

  /**
   * Handle publishing a document. Display a modal to the user
   * to first confirm the action.
   */
  public onPublishDocument(): void {
    this.ngxSmartModalService.setModalData({
      type: 'publish',
      title: 'Publish Document(s)',
      message: 'Click <strong>OK</strong> to publish the selected Documents or <strong>Cancel</strong> to return to the list.'
    }, 'confirmation-modal', true);

    this.ngxSmartModalService.open('confirmation-modal');
  }

  /**
   * Publish a document. Make a call to the document service
   * for each selected document.
   */
  private internalPublishDocument(): void {
    this.loading = true;
    let observables = [];
    this.documentTableData.data.map(item => {
      if (item.checkbox && !item.read.includes('public')) {
        observables.push(this.documentService.publish(item._id));
      }
    });
    forkJoin(observables)
      .subscribe(
        res => { },
        err => {
          console.error('Error:', err);
        },
        () => {
          this.loading = false;
          this.canUnpublish = false;
          this.canPublish = false;
          this.reloadSearchResults();
        }
      );
  }

  /**
   * Handle un-publishing a document. Display a modal to the user
   * to first confirm the action.
   */
  public onUnpublishDocument(): void {
    this.ngxSmartModalService.setModalData({
      type: 'unpublish',
      title: 'Unpublish Document(s)',
      message: 'Click <strong>OK</strong> to unpublish the selected Documents or <strong>Cancel</strong> to return to the list.'
    }, 'confirmation-modal', true);

    this.ngxSmartModalService.open('confirmation-modal');
  }

  /**
   * Un-publish a document. Make a call to the document service
   * for each selected document.
   */
  private internalUnpublishDocument(): void {
    this.loading = true;
    let observables = [];
    this.documentTableData.data.map(item => {
      if (item.checkbox && item.read.includes('public')) {
        observables.push(this.documentService.unPublish(item._id));
      }
    });
    forkJoin(observables)
      .subscribe(
        res => {},
        err => {
          console.error('Error:', err);
        },
        () => {
          this.loading = false;
          this.canUnpublish = false;
          this.canPublish = false;
          this.reloadSearchResults();
        }
      );
  }

  /**
   * Handler for deleting docuements. First displays a confirmation
   * modal to the user before proceeding.
   */
  public onDeleteDocument(): void {
    this.ngxSmartModalService.setModalData({
      type: 'delete',
      title: 'Delete Document',
      message: 'Click <strong>OK</strong> to delete this Document or <strong>Cancel</strong> to return to the list.'
    }, 'confirmation-modal', true);

    this.ngxSmartModalService.open('confirmation-modal');
  }

  /**
   * Delete a document. Make a call to the document service
   * to delete every checked document.
   */
  private internalDeleteDocument(): void {
    this.loading = true;
    // Delete the Document(s)
    let itemsToDelete = [];
    this.documentTableData.data.map((item) => {
      if (item.checkbox === true) {
        itemsToDelete.push({ promise: this.documentService.delete(item).toPromise(), item: item });
      }
    });
    this.loading = false;
    Promise.all(itemsToDelete).then(() => {
      // Reload main page.
      this.reloadSearchResults();
    });
  }

  /**
   * Angular Router doesn't reload page on same URL.
   * As a workaround, add timestamp to force URL to be different than last time.
   *
   * @see https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
   */
  private updateWindowEncodeURI() {
    const encode = encodeURIComponent;
    window['encodeURIComponent'] = (component: string) => {
      return encode(component).replace(/[!'()*]/g, (c) => {
        // Also encode !, ', (, ), and *
        return '%' + c.charCodeAt(0).toString(16);
      });
    };
  }

  /**
   * When a user selects a number of documents to show in the table.
   *
   * @param {number|string} numItems The number of documents to display(or "max").
   */
  public onNumItems(numItems: number|string) {
    this.updateWindowEncodeURI();

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy;
    params['keywords'] = this.tableParams.keywords;
    if ('max' === numItems) {
      params['pageSize'] = this.tableParams.pageSize = this.tableParams.totalListItems
    } else if ('number' === typeof numItems){
      params['pageSize'] = this.tableParams.pageSize = numItems;
    }

    this.router.navigate(['p', this.currentProject._id, 'project-files', params]);
  }

  /**
   * Reload the document search results based on the set table params.
   */
  public reloadSearchResults(): void {
    this.updateWindowEncodeURI();

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '-datePosted';
    params['keywords'] = encodeURIComponent(this.tableParams.keywords = this.tableParams.keywords || '').replace(/\(/g, '%28').replace(/\)/g, '%29');
    params['pageSize'] = this.tableParams.pageSize = 10;

    this.router.navigate(['p', this.currentProject._id, 'project-files', params]);
  }

  /**
   * Set the data to use in the table UI component. This displays
   * the loaded documents to the user.
   */
  setRowData(): void {
    let documentList = [];
    if (this.documents && this.documents.length > 0) {
      this.documents.forEach(document => {
        documentList.push(
          {
            displayName: document.displayName,
            documentFileName: document.documentFileName,
            internalSize: document.internalSize,
            internalExt: document.internalExt,
            datePosted: document.datePosted,
            status: document.read.includes('public') ? 'Published' : 'Not Published',
            _id: document._id,
            project: document.project,
            read: document.read
          }
        );
      });
      this.documentTableData = new TableObject(
        DocumentTableRowsComponent,
        documentList,
        this.tableParams
      );
    }
  }

  /**
   * Sort existing results by column(name, date, size, type, etc.)
   *
   * @param {string} column The column to sort by.
   */
  setColumnSort(column: string): void {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  /**
   * Checks the current selectedCount and if publishing is possible.
   * If not, then grey out the button that allows a certain action.
   *
   * @param {string} button The button or action chosen.
   * @returns If the button corresponding with an action is not disabled.
   */
  isEnabled(button: string): boolean {
    switch (button) {
      case 'copyLink':
        return this.selectedCount === 1;
      case 'publish':
        return this.selectedCount > 0 && this.canPublish;
      case 'unpublish':
        return this.selectedCount > 0 && this.canUnpublish;
      default:
        return this.selectedCount > 0;
    }
  }

  /**
   * If a document is selected, enable the user's ability to publish it.
   *
   * @param {number} count The row number.
   */
  public updateSelectedRow(count: number): void {
    this.selectedCount = count;
    this.toggleCanPublish();
  }

  /**
   * Checks if a document is publishable by checking it's
   * current published state.
   */
  public toggleCanPublish(): void {
    this.canPublish = false;
    this.canUnpublish = false;
    for (let document of this.documentTableData.data) {
      if (document.checkbox) {
        if (document.read.includes('public')) {
          this.canUnpublish = true;
        } else {
          this.canPublish = true;
        }
      }

      if (this.canPublish && this.canUnpublish) {
        return;
      }
    }
  }

  /**
   * Get files with a certain extension. Update table params and URL to
   * match requested file types.
   *
   * @param {string} fileTypeToLoad The general file type to filter by.
   */
  public filterFilesByType(fileTypeToLoad: string): void {
    const fileTypes = {
      image: 'png,jpg,jpeg,gif,bmp',
      document: 'doc,docx,pdf,xls,xlsx,txt,ppt,pptx',
      shapefile: 'zip'
    };
    this.tableParams.filter = { internalExt: fileTypes[fileTypeToLoad] };

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, 1, this.tableParams.sortBy);
    this.searchService.getSearchResults(
      '',
      'Document',
      [{ 'name': 'project', 'value': this.currentProject._id }],
      1,
      10,
      '-datePosted',
      this.tableParams.filter,
      true
    ).subscribe(res => {
      this.tableParams.totalListItems = 0;
      this.documents = [];

      if (res[0]?.data?.meta[0]?.searchResultsTotal) {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.documents = res[0].data.searchResults;
      }

      this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.filter, this.tableParams.keywords || '');
      this.setRowData();
      this._changeDetectionRef.detectChanges();
    })
  }

  /**
   * Load a "page" of documents.
   *
   * @param {number} pageNumber The page number of documents to get.
   */
  public getPaginatedDocs(pageNumber: number): void {
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
      this.tableParams.filter,
      true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.documents = res[0].data.searchResults;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.filter, this.tableParams.keywords || '');
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
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
