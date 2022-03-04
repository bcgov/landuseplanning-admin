import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Document } from 'app/models/document';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Utils } from 'app/shared/utils/utils';
import { isEmpty } from 'lodash';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document: Document = null;
  public currentProject: Project = null;
  public publishText: string;
  public humanReadableSize: string;
  public pathAPI: string;
  public documentUrl: string;

  constructor(
    public utils: Utils,
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
    private ngxSmartModalService: NgxSmartModalService,
  ) {
    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
    this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;
  }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.document = res.document;
        const safeName = this.document.documentFileName.replace(/ /g, '_');
        this.documentUrl = `${this.pathAPI}/document/${this.document._id}/fetch/${safeName}`;
        if (this.document.read.includes('public')) {
          this.publishText = 'Unpublish';
        } else {
          this.publishText = 'Publish';
        }
        this._changeDetectionRef.detectChanges();
      });
      this.humanReadableSize = this.utils.formatBytes(this.document.internalSize);

    this.ngxSmartModalService.getModal('confirmation-modal').onAnyCloseEventFinished
      .takeUntil(this.ngUnsubscribe)
      .subscribe((modal) => {
      const data = this.ngxSmartModalService.getModalData('confirmation-modal');
        if (this.publishText === 'Publish') {
          if (data.publishConfirm) {
            this.documentService.publish(this.document._id).subscribe(
              res => { },
              error => {
                console.error('error =', error);
                alert('Uh-oh, couldn\'t update document');
              },
              () => {
                this.openSnackBar('This document has been published.', 'Close');
              }
            );
            this.publishText = 'Unpublish';
          }
        } else {
          this.documentService.unPublish(this.document._id).subscribe(
            res => { },
            error => {
              console.error('error =', error);
              alert('Uh-oh, couldn\'t update document');
            },
            () => {
              this.openSnackBar('This document has been unpublished.', 'Close');
            }
          );
          this.publishText = 'Publish';
        }
      });
  }

  onEdit() {
    this.storageService.state.selectedDocs = [this.document];
    this.storageService.state.labels = this.document.labels;
    this.storageService.state.back = { url: ['/p', this.document.project, 'project-files', 'detail', this.document._id], label: 'View File' };
    this.router.navigate(['p', this.document.project, 'project-files', 'edit']);
  }

  public togglePublish() {
      this.ngxSmartModalService.setModalData({
        type: 'publish',
        title: 'Confirm Publish',
        message: 'Publishing this document will make it visible to the public. <br><br> Do you have Ministry Government Communications and Public Engagement (GCPE) approvals on all content? <br><br> Are you sure you want to proceed?'
      }, 'confirmation-modal', true);

      this.ngxSmartModalService.open('confirmation-modal');
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
