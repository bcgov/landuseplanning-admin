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
import { DocumentSection } from 'app/models/documentSection';
import { ExternalLink } from 'app/models/externalLink';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document = null; // Document or ExternalLink
  public currentProject: Project = null;
  public publishText: string;
  public humanReadableSize: string;
  public pathAPI: string;
  public documentUrl: string;
  public sections: DocumentSection[];
  public selectedSection: DocumentSection = null;

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

  /**
   * Get the current project from local storage. Then, get the associated document
   * from local storage along with the accessible document URLs. Set up the
   * modal service to handle publishing/unpublishing the project.
   *
   * @return {void}
   */
  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.document = res.document.document;
        this.sections = res.document.sections;
        this.selectedSection = this.sections.find((section) => section._id === this.document.section);
        const safeName = this.document?.documentFileName ? this.document.documentFileName.replace(/ /g, '_') : this.document.externalLink;
        this.documentUrl = this.document?.externalLink ? safeName : `${this.pathAPI}/document/${this.document._id}/fetch/${safeName}`;
				this.publishText = !this.document.read?.includes('public') ? 'Publish' : 'Unpublish';
				
        this._changeDetectionRef.detectChanges();
      });
      this.humanReadableSize = this.utils.formatBytes(this.document?.internalSize) || '';

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

	/**
	 * Maps row data to a format that is familiar to the edit form.
	 * 
	 * @param {any} file The file to be mapped, Document or ExternalLink
	 * @returns {object}
	 * 
	 */
	mapRowData(file) {
		return {
			displayName: file.displayName,
			documentFileName: file.documentFileName || file.externalLink || '',
			internalSize: file.internalSize || null,
			internalExt: file.internalExt || 'external',
			datePosted: file.datePosted || file.dateAdded,
			status: file.read.includes('public') ? 'Published' : 'Not Published',
			_id: file._id,
			project: file.project,
			read: file.read,
			projectPhase: file.projectPhase,
			description: file.description,
			section: file.section,
		}
	}

  /**
   * When a project edit is initiated, get the associated documents
   * from local storage. Also add the router destination for the project
   * detail view. Finally navigate the user to the "edit project" view.
   *
   * @return {void}
   */
  onEdit() {
    this.storageService.state.selectedDocs = [this.mapRowData(this.document)];
    this.storageService.state.labels = this.document.labels || [];
    this.storageService.state.back = { url: ['/p', this.document.project, 'project-files', 'detail', this.document._id], label: 'View File' };
		this.router.navigate(['p', this.document.project, 'project-files', (this.document.externalLink ? 'edit-link' : 'edit')]);
  }

	onDownload() {
		if (this.document.externalLink) {
			window.open(this.document.externalLink, "_blank");
		} else {
			this.api.downloadDocument(this.document);
		}
	}

	onOpen() {
		if (this.document.externalLink) {
			window.open(this.document.externalLink, "_blank");
		} else {
			this.api.openDocument(this.document);
		}
	}

  /**
   * Checks if a document is published.
   *
   * @param {Document} file The document to check the publish status of.
   * @returns If the file is published or not.
   */
  public isPublished(file: Document): boolean {
    return file?.read?.includes('public');
  }

  /**
   * Update the modal service to prompt the user to confirm the publishing
   * of a project. Then update the modal to display to the user.
   *
   * @return {void}
   */
  public togglePublish() {
      this.ngxSmartModalService.setModalData({
        type: 'publish',
        title: 'Confirm Publish',
        message: 'Publishing this document will make it visible to the public. <br><br> Do you have Ministry Government Communications and Public Engagement (GCPE) approvals on all content? <br><br> Are you sure you want to proceed?'
      }, 'confirmation-modal', true);

      this.ngxSmartModalService.open('confirmation-modal');
  }

  /**
   * Opens a new snack bar notification message with a duration of 2 seconds, and executes an action.
   *
   * @param {string} message A snack bar notification message.
   * @param {string} action A snack bar notification action.
   * @returns {void}
   */
   public openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
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
