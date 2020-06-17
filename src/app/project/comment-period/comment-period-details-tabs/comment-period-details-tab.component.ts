import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';

import { CommentPeriod } from 'app/models/commentPeriod';

import { Survey } from 'app/models/survey';
import { SurveyService } from 'app/services/survey.service';

import { ApiService } from 'app/services/api';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-comment-period-details-tab',
  templateUrl: './comment-period-details-tab.component.html',
  styleUrls: ['./comment-period-details-tab.component.scss']
})

export class CommentPeriodDetailsTabComponent implements OnInit, OnChanges, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  @Input() public commentPeriod: CommentPeriod;
  @Input() public surveys: Array<Survey>;
  @Input() public surveysWithResponses: Array<any>;

  public commentPeriodPublishedStatus: string;
  public publishAction: string;
  public projectId: string;
  public loading = true;
  public commentPeriodDocs = [];
  public canDeleteCommentPeriod = false;
  public prettyCommentingMethod: string;
  public surveySelected: string;
  public surveyNames = {};

  constructor(
    private api: ApiService,
    private surveyService: SurveyService,
    private commentPeriodService: CommentPeriodService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private ngxSmartModalService: NgxSmartModalService
  ) { }

  ngOnInit() {
    this.setPublishStatus();
    this.projectId = this.storageService.state.currentProject.data._id;

    if (this.commentPeriod.relatedDocuments.length > 0) {
      this.documentService.getByMultiId(this.commentPeriod.relatedDocuments)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          data => {
            this.commentPeriodDocs = data;
          }
        );
    }

    if (!this.surveys) {
      this.route.data.subscribe(res => {this.surveys = res.cpAndSurveys.surveys.data})
    }

    // Set up listener for modal when it returns
    this.ngxSmartModalService.getModal('confirmation-modal').onAnyCloseEventFinished
    .takeUntil(this.ngUnsubscribe)
    .subscribe(() => {
      const data = this.ngxSmartModalService.getModalData('confirmation-modal');
      data.selection ? this.exportSurveyResponses(this.commentPeriod._id, data.selection) : null;
    })

    this.surveySelected = this.commentPeriod.surveySelected;
    this.loading = false;
  }

  ngOnChanges() {
    if (this.surveys) {
      this.surveys.forEach(survey => this.surveyNames[survey._id] = survey.name)
    }

    if (this.surveysWithResponses) {
      for (let surveyId in this.surveyNames) {
        if (!this.surveysWithResponses.includes(surveyId)) {
          delete this.surveyNames[surveyId]
        }
      }
    }
  }

  setPublishStatus() {
    this.commentPeriodPublishedStatus = this.commentPeriod.isPublished ? 'Published' : 'Not Published';
    this.publishAction = this.commentPeriod.isPublished ? 'Un-Publish' : 'Publish';
  }

  public togglePublishState() {
    if (confirm(`Are you sure you want to ${this.publishAction} this comment period?`)) {
      this.loading = true;
      if (this.commentPeriod.isPublished) {
        this.commentPeriodService.unPublish(this.commentPeriod)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (res => {
              this.commentPeriod.isPublished = false;
              this.setPublishStatus();
              this.openSnackBar('This comment period has been un-published.', 'Close');
              this.loading = false;
            })
          );
      } else {
        this.commentPeriodService.publish(this.commentPeriod)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (res => {
              this.commentPeriod.isPublished = true;
              this.setPublishStatus();
              this.openSnackBar('This comment period has been published.', 'Close');
              this.loading = false;
            })
          );
      }
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  editCommentPeriod() {
    this.router.navigateByUrl(`/p/${this.projectId}/cp/${this.commentPeriod._id}/edit`);
  }

  deleteCommentPeriod() {
    if (confirm(`Are you sure you want to delete this comment period?`)) {
      this.loading = true;
      this.commentPeriodService.delete(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t delete comment period');
          },
          () => { // onCompleted
            // delete succeeded --> navigate back to search
            // Clear out the document state that was stored previously.
            this.loading = false;
            this.openSnackBar('This comment period has been deleted', 'Close');
            this.router.navigate(['p', this.projectId, 'comment-periods']);
          }
        );
    }
  }

  public addComment() {
    this.router.navigate(['/p', this.commentPeriod.project, 'cp', this.commentPeriod._id, 'add-comment']);
  }

  public exportComments() {
    // Export all comments to CSV
    this.openSnackBar('Download Initiated', 'Close');
    this.api.exportComments(this.commentPeriod._id);
  }

  public onExportSurveyResponses() {
    // Export all survey responses to CSV
    if (this.surveysWithResponses.length > 1) {
      this.ngxSmartModalService.setModalData({
        selectData: this.surveyNames,
        selectLabel: 'survey',
        type: 'select',
        title: 'Export responses by survey',
        message: 'More than one survey has been responded to. <br /> Please select which responses to export by survey.'
      }, 'confirmation-modal', true);

      this.ngxSmartModalService.open('confirmation-modal');
    } else {
      this.exportSurveyResponses(this.commentPeriod._id);
    }
  }

  exportSurveyResponses(cpID, surveyID?) {
    surveyID = surveyID || null;
    this.openSnackBar('Download Initiated', 'Close');
    this.api.exportSurveyResponses(cpID, surveyID);
  }


  public downloadDocument(document) {
    return this.api.downloadDocument(document).then(() => {
      console.log('Download initiated for file');
    });
  }

  public checkIfCanDelete() {
    this.canDeleteCommentPeriod = this.storageService.state.canDeleteCommentPeriod.data;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
