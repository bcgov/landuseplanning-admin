import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Document } from 'app/models/document';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { DocumentSectionService } from 'app/services/documentSection.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Utils } from 'app/shared/utils/utils';
import { isEmpty } from 'lodash';
import { NavBarButton, PageBreadcrumb } from 'app/shared/components/navbar/types';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';

@Component({
  selector: 'app-files-section',
  templateUrl: './project-files-section.component.html',
  styleUrls: ['./project-files-section.component.scss'],
})
export class ProjectFilesSectionComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document: Document = null;
  public currentProject: Project = null;
  public publishText: string;
  public humanReadableSize: string;
  public pathAPI: string;
  public documentUrl: string;
  public navBarButtons: NavBarButton[];
  public pageBreadcrumbs: PageBreadcrumb[];
  public loading = false;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    public utils: Utils,
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private documentSectionService: DocumentSectionService,
    private ngxSmartModalService: NgxSmartModalService,

  ) {
    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
    this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;
  }

  /**
   * Get the current project from local storage. Then, get the file sections
   * associated with this project.
   *
   * @return {void}
   */
  ngOnInit() {
    this.route.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      if (res) {
        // if (res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
        //   this.tableParams.totalListItems = res.documents[0].data.meta[0].searchResultsTotal;
        //   this.documents = res.documents[0].data.searchResults;
        // } else {
        //   this.tableParams.totalListItems = 0;
        //   this.documents = [];
        // }
        // this.setRowData();
        // this.loading = false;
        // this._changeDetectionRef.detectChanges();
        console.log('res', res)
      } else {
        alert('Uh-oh, couldn\'t load valued components');
        // project not found --> navigate back to search
        this.router.navigate(['/search']);
      }
    });

    this.currentProject = this.storageService.state.currentProject.data;
    this.ngxSmartModalService.setModalData({
      type: 'add',
      title: 'Add File Section',
    }, 'add-files-section-modal', true);
    this.pageBreadcrumbs = [
      { pageTitle: this.currentProject.name, routerLink: [ '/p', this.currentProject._id ] },
      { pageTitle: "Files" , routerLink: [ '/p', this.currentProject._id, 'project-files' ]}
    ];
    this.navBarButtons = [
      {
        label: 'Add File Section',
        action: () => this.ngxSmartModalService.open('add-files-section-modal')
      }
    ];
  }

  /**
   * After view init, listen for the file upload modal to close and check if it returned
   * files that can be saved in the Project. If files are returned, add their IDs to
   * project logos.
   *
   * @todo Get returned data into project form.
   * @returns {void}
   */
  ngAfterViewInit(): void {
    this.ngxSmartModalService.getModal('add-files-section-modal').onAnyCloseEventFinished.subscribe((modal: NgxSmartModalComponent) => {
      if ('save' ===  modal.getData()) {
        // Reload all doc sections...
      }
    })
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
