import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { Document } from 'app/models/document';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';
import { MatSnackBar } from '@angular/material';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from 'app/confirm/confirm.component';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
    private dialogService: DialogService,
  ) {}

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.document = res.document;
        console.log(document);
        if (this.document.read.includes('public')) {
          this.publishText = 'Unpublish';
        } else {
          this.publishText = 'Publish';
        }
        this._changeDetectionRef.detectChanges();
      });
      this.humanReadableSize = this.formatBytes(this.document.internalSize);
  }

  onEdit() {
    this.storageService.state.selectedDocs = [this.document];
    this.storageService.state.labels = this.document.labels;
    this.storageService.state.back = { url: ['/p', this.document.project, 'project-documents', 'detail', this.document._id], label: 'View Document' };
    this.router.navigate(['p', this.document.project, 'project-documents', 'edit']);
  }

  public togglePublish() {
    if (this.publishText === 'Publish') {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Confirm Publish',
          message: 'Publishing this document will make it visible to the public. <br><br> Do you have Ministry Government Communications and Public Engagement (GCPE) approvals on all content? <br><br> Are you sure you want to proceed?',
          okOnly: false
        }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          isConfirmed => {
            if (isConfirmed) {
              this.documentService.publish(this.document._id).subscribe(
                res => { },
                error => {
                  console.log('error =', error);
                  alert('Uh-oh, couldn\'t update document');
                },
                () => {
                  this.openSnackBar('This document has been published.', 'Close');
                }
              );
              this.publishText = 'Unpublish';
            }
          }
        );

    } else {
      this.documentService.unPublish(this.document._id).subscribe(
        res => { },
        error => {
          console.log('error =', error);
          alert('Uh-oh, couldn\'t update document');
        },
        () => {
          this.openSnackBar('This document has been unpublished.', 'Close');
        }
      );
      this.publishText = 'Publish';
    }
  }

  private formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
