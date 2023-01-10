import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';
import { StorageService } from 'app/services/storage.service';

import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Document } from 'app/models/document';

import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-review-comment',
  templateUrl: './review-comment.component.html',
  styleUrls: ['./review-comment.component.scss']
})

export class ReviewCommentComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public currentProject;
  public comment: Comment;
  public commentPeriod: CommentPeriod;
  public loading = true;
  public isRejectedRequired = false;
  public commentReviewForm: FormGroup;
  public pendingCommentCount = 0;
  public nextCommentId;

  constructor(
    private api: ApiService,
    private commentService: CommentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private utils: Utils
  ) { }

  /**
   * Get the current project from local storage, then get the comment to
   * review, get the comment period(or notify the user if it's not found).
   *
   * @return {void}
   */
  ngOnInit(): void {
    this.currentProject = this.storageService.state.currentProject.data;
    this.storageService.state.selectedTab = 1;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
        if (data.comment) {
          this.comment = data.comment;

          if (this.storageService.state.currentCommentPeriod) {
            this.commentPeriod = this.storageService.state.currentCommentPeriod.data;
          } else if (data.cpAndSurveys.commentPeriod) {
            // On a hard reload we need to get the comment period.
            this.commentPeriod = data.cpAndSurveys.commentPeriod;
            this.storageService.state.currentCommentPeriod = { type: 'currentCommentPeriod', data: this.commentPeriod };
          } else {
            alert('Uh-oh, couldn\'t load comment period');
            // comment period not found --> navigate back to search
            this.router.navigate(['/search']);
          }

          // This is populated in commentService.
          this.pendingCommentCount = this.commentService.pendingCommentCount;
          this.nextCommentId = this.commentService.nextCommentId;

          this.initForm();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load comment');
          // comment period not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  /**
   * Initialize a new empty form group for the comment review then populate
   * it with the comment data.
   *
   * @return {void}
   */
  private initForm(): void {
    this.commentReviewForm = new FormGroup({
      'dateAdded': new FormControl({ value: '', disabled: true }),
      'datePosted': new FormControl({ value: '', disabled: true }),
      'deferralNotesText': new FormControl(),
      'isNamePublic': new FormControl({ value: false, disabled: true }),
      'isDeferred': new FormControl(),
      'isPublished': new FormControl(),
      'isRejected': new FormControl(),
      'proponentResponseText': new FormControl(),
      'publishedNotesText': new FormControl(),
      'rejectionNotesText': new FormControl()
    });

    this.setEaoStatus(this.comment.eaoStatus);

    this.commentReviewForm.controls.dateAdded.setValue(this.utils.convertJSDateToNGBDate(new Date(this.comment.dateAdded)));
    this.commentReviewForm.controls.datePosted.setValue(this.utils.convertJSDateToNGBDate(new Date(this.comment.datePosted)));
    this.commentReviewForm.controls.deferralNotesText.setValue(this.comment.eaoNotes);
    this.commentReviewForm.controls.isNamePublic.setValue(!this.comment.isAnonymous);
    this.commentReviewForm.controls.proponentResponseText.setValue(this.comment.proponentNotes);
    this.commentReviewForm.controls.publishedNotesText.setValue(this.comment.publishedNotes);
    this.commentReviewForm.controls.rejectionNotesText.setValue(this.comment.rejectedNotes);
  }

  /**
   * On form submission, update the comment with the reponse
   * (publish, reject, defer, pending), save the response by hitting
   * the comment API, then move on to the next comment to review, or exit.
   *
   * @param {string} action Whether to move to the next comment or stop review.
   * @return {void}
   */
  public onSubmit(action: string): void {
    this.loading = true;

    this.comment.isAnonymous = !this.commentReviewForm.get('isNamePublic').value;

    this.comment.dateAdded = this.utils.convertFormGroupNGBDateToJSDate(this.commentReviewForm.get('dateAdded').value);
    this.comment.datePosted = this.utils.convertFormGroupNGBDateToJSDate(this.commentReviewForm.get('datePosted').value);

    // TODO: Validation
    if (this.commentReviewForm.get('isPublished').value) {
      this.comment.publishedNotes = this.commentReviewForm.get('publishedNotesText').value;
      this.comment.eaoStatus = 'Published';
    } else if (this.commentReviewForm.get('isDeferred').value) {
      this.comment.eaoNotes = this.commentReviewForm.get('deferralNotesText').value;
      this.comment.eaoStatus = 'Deferred';
    } else if (this.commentReviewForm.get('isRejected').value) {
      this.comment.eaoNotes = this.commentReviewForm.get('rejectionNotesText').value;
      this.comment.eaoStatus = 'Rejected';
    } else {
      this.comment.eaoStatus = 'Reset';
    }
    this.comment.proponentNotes = this.commentReviewForm.get('proponentResponseText').value;

    let previousCommentId = this.comment.commentId;
    this.commentService.save(this.comment)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        newComment => {
          this.comment = newComment;
        },
        error => {
          console.error(error);
          alert('Uh-oh, couldn\'t edit comment');
        },
        () => {
          this.openSnackBar(`Comment #${previousCommentId} updated.`, 'Close');
          switch (action) {
            case 'exit': {
              this.router.navigate(['/p', this.currentProject._id, 'cp', this.commentPeriod._id]);
              break;
            }
            case 'next': {
              this.router.navigate(['/p', this.currentProject._id, 'cp', this.commentPeriod._id, 'c', this.nextCommentId, 'comment-details']);
              break;
            }
            default: {
              break;
            }
          }
          this.loading = false;
        }
      );
  }

  /**
   * Cancel a review and exit the form. Prompt the user to confirm first,
   * then navigate away from the form.
   *
   * @return {void}
   */
  public onCancel(): void {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.router.navigate(['/p', this.currentProject._id, 'cp', this.commentPeriod._id]);
    }
  }

  /**
   * Handle setting the "response" to a comment. When adding the comment
   * the user can publish, defer, or reject it immediately.
   *
   * If no status is set by the user, set the status to "pending."
   *
   * @param {string} status The comment status(publish, defer, reject).
   * @return {void}
   */
   public setEaoStatus(status: string): void {
    switch (status) {
      case 'Published': {
        if (!this.commentReviewForm.get('isPublished').value) {
          this.commentReviewForm.controls.isPublished.setValue(true);
          this.commentReviewForm.controls.isDeferred.setValue(false);
          this.commentReviewForm.controls.isRejected.setValue(false);
        } else {
          this.commentReviewForm.controls.isPublished.setValue(false);
        }
        break;
      }
      case 'Deferred': {
        if (!this.commentReviewForm.get('isDeferred').value) {
          this.commentReviewForm.controls.isPublished.setValue(false);
          this.commentReviewForm.controls.isDeferred.setValue(true);
          this.commentReviewForm.controls.isRejected.setValue(false);
        } else {
          this.commentReviewForm.controls.isDeferred.setValue(false);
        }
        break;
      }
      case 'Rejected': {
        if (!this.commentReviewForm.get('isRejected').value) {
          this.commentReviewForm.controls.isPublished.setValue(false);
          this.commentReviewForm.controls.isDeferred.setValue(false);
          this.commentReviewForm.controls.isRejected.setValue(true);

          this.comment.documentsList.forEach(document => {
            document.eaoStatus = 'Rejected';
          });
        } else {
          this.commentReviewForm.controls.isRejected.setValue(false);
        }
        break;
      }
      default: {
        // Has no eaoStatus. Probably brand new or has been reset.
        this.commentReviewForm.controls.isPublished.setValue(false);
        this.commentReviewForm.controls.isDeferred.setValue(false);
        this.commentReviewForm.controls.isRejected.setValue(false);
        break;
      }
    }
    this._changeDetectionRef.detectChanges();
  }

  /**
   * Send a call to the API to download a given document/file. Return the
   * async response.
   *
   * @param {Document} document The document(file) to download.
   * @returns {Promise<void>}
   */
   public downloadDocument(document: Document) {
    return this.api.downloadDocument(document);
  }

  /**
   * When the document is published or rejected, update the document object.
   *
   * @param {Document} document The document object to update.
   * @param {string} action Whether to publish or reject the document.
   * @return {void}
   */
   public toggleDocumentPublish(document: Document, action: string): void {
    if (action === 'Published' && !this.commentReviewForm.get('isRejected').value) {
      document.eaoStatus = 'Published';
    } else if (action === 'Rejected' && !this.commentReviewForm.get('isRejected').value) {
      document.eaoStatus = 'Rejected';
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
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
