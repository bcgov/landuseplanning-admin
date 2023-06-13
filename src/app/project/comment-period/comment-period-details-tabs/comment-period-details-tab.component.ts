import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
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

  /**
   * Set the default publish status of the comment period, update the project
   * ID, check for comment period documents and fetch them from the API, get
   * surveys associated with the comment period, and set up the modal window
   * to be used later.
   *
   * @return {void}
   */
  ngOnInit(): void {
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

  /**
   * When any data-bound property of a directive changes, update the current
   * survey names by removing surveys without responses from that list.
   *
   * @return {void}
   */
  ngOnChanges(): void {
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

  /**
   * Update the properties related to publish status.
   *
   * @return {void}
   */
  setPublishStatus(): void {
    this.commentPeriodPublishedStatus = this.commentPeriod.isPublished ? 'Published' : 'Not Published';
    this.publishAction = this.commentPeriod.isPublished ? 'Un-Publish' : 'Publish';
  }

  /**
   * Toggle the publish state of a comment period. First, confirm the action with
   * the user, then send an API request to publish/unpublish and update the user
   * when that action is complete.
   *
   * @return {void}
   */
  public togglePublishState(): void {
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
   * Navigate the user to the edit comment period form.
   *
   * @return {void}
   */
  editCommentPeriod(): void {
    this.router.navigateByUrl(`/p/${this.projectId}/cp/${this.commentPeriod._id}/edit`);
  }

  /**
   * Delete a comment period. First prompt the user to confirm, then send a
   * delete request to the API. Finally, display a message to the user
   * that the process was successful or not.
   *
   * @return {void}
   */
  deleteCommentPeriod(): void {
    if (confirm(`Are you sure you want to delete this comment period?`)) {
      this.loading = true;
      this.commentPeriodService.delete(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.error(error);
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

  /**
   * Add a new comment to this comment period. Navigate the user to
   * the add comment form.
   *
   * @return {void}
   */
  public addComment(): void {
    this.router.navigate(['/p', this.commentPeriod.project, 'cp', this.commentPeriod._id, 'add-comment']);
  }

  /**
   * Export all comments from this comment period. Provide feedback
   * to the user, then contact the API to initiate the export.
   *
   * @return {void}
   */
  public exportComments(): void {
    // Export all comments to CSV
    this.openSnackBar('Download Initiated', 'Close');
    this.api.exportComments(this.commentPeriod._id);
  }

  /**
   * If there are multiple surveys attached to the comment period, prompt
   * the user to choose which survey to export the responses of.
   *
   * @return {void}
   */
  public onExportSurveyResponses(): void {
    // Export all survey responses to CSV
    if (this.surveysWithResponses.length > 1) {
      this.ngxSmartModalService.setModalData({
        selectData: this.surveyNames,
        selectLabel: 'survey',
        type: 'select',
        title: 'Export responses by survey',
        message: 'This comment period has more than one survey with responses. <br /> Please select which responses to export by survey.'
      }, 'confirmation-modal', true);

      this.ngxSmartModalService.open('confirmation-modal');
    } else {
      this.exportSurveyResponses(this.commentPeriod._id);
    }
  }

  /**
   * Send a call to the API to export survey responses and prompt the user
   * that it's been initiated.
   *
   * @param {string} cpID Comment period ID.
   * @param {string} surveyID Survey ID to export responses for.
   * @return {void}
   */
  exportSurveyResponses(cpID, surveyID?): void {
    surveyID = surveyID || null;
    this.openSnackBar('Download Initiated', 'Close');
    this.api.exportSurveyResponses(cpID, surveyID);
  }

  /**
   * Send a call to the API to download a given document/file. Return the
   * async response.
   *
   * @param {Document} document The document(file) to download.
   * @returns {Promise<void>}
   */
  public downloadDocument(document) {
    return this.api.downloadDocument(document);
  }

  /**
   * Get the value from the storage service that the comment period can be
   * deleted.
   *
   * @return {void}
   */
  public checkIfCanDelete(): void {
    this.canDeleteCommentPeriod = this.storageService.state.canDeleteCommentPeriod.data;
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
