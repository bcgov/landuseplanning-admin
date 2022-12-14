import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';

import { Utils } from 'app/shared/utils/utils';

import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Document } from 'app/models/document';

import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})

export class AddCommentComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public currentProject;
  public comment = new Comment();
  public commentPeriod: CommentPeriod;
  public commentFiles: Array<File> = [];
  public documents: Document[] = [];
  public loading = true;

  public addCommentForm: FormGroup;
  public commentingMethod: string;
  public externalEngagementTool: boolean;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private utils: Utils
  ) { }

  /**
   * Get the current coment period's commenting method, then initialize the
   * relevant commenting form.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: any) => {
        if (data) {
          this.commentPeriod = data.commentPeriod;
          if (this.commentPeriod.commentingMethod) {
            this.commentingMethod = this.commentPeriod.commentingMethod;
            if (this.commentingMethod === 'externalEngagementTool') {
              this.externalEngagementTool = true;
            } else {
              this.externalEngagementTool = false;
            }
          } else {
            this.initForm();
          }
        } else {
          alert('Uh-oh, couldn\'t load comment period');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
        this.loading = false;
      });
  }

  /**
   * Set up a new, empty form group for a comment form. Set comment anonymity
   * to false by default and set the date the comment was(will be) made to
   * the current date.
   * 
   * @return {void}
   */
  private initForm(): void {
    this.addCommentForm = new FormGroup({
      'authorText': new FormControl(),
      'commentText': new FormControl(),
      'dateAdded': new FormControl(),
      'datePosted': new FormControl(),
      'deferralNotesText': new FormControl(),
      'isNamePublic': new FormControl(),
      'isDeferred': new FormControl(),
      'isPublished': new FormControl(),
      'isRejected': new FormControl(),
      'locationText': new FormControl(),
      'proponentResponseText': new FormControl(),
      'rejectionNotesText': new FormControl(),
      'publishedNotesText': new FormControl()
    });
    this.addCommentForm.controls.isNamePublic.setValue(false);
    this.addCommentForm.controls.dateAdded.setValue(this.utils.convertJSDateToNGBDate(new Date()));
    this.addCommentForm.controls.datePosted.setValue(this.utils.convertJSDateToNGBDate(new Date()));
  }

  /**
   * Handle the form submission. Translate various form values to their internal
   * equivalents. Convert bootstrap date format to Javascript format. Finally,
   * submit the form by making a post request to the comment API.
   * 
   * @return {void}
   */
  public onSubmit(): void {
    this.loading = true;

    this.comment.author = this.addCommentForm.get('authorText').value;
    this.comment.comment = this.addCommentForm.get('commentText').value;
    this.comment.dateAdded = this.utils.convertFormGroupNGBDateToJSDate(this.addCommentForm.get('dateAdded').value);
    this.comment.datePosted = this.utils.convertFormGroupNGBDateToJSDate(this.addCommentForm.get('datePosted').value);
    this.comment.isAnonymous = !this.addCommentForm.get('isNamePublic').value;
    this.comment.location = this.addCommentForm.get('locationText').value;

    // TODO: Validation
    if (this.addCommentForm.get('isPublished').value) {
      this.comment.publishedNotes = this.addCommentForm.get('publishedNotesText').value;
      this.comment.eaoStatus = 'Published';
    } else if (this.addCommentForm.get('isDeferred').value) {
      this.comment.eaoNotes = this.addCommentForm.get('deferralNotesText').value;
      this.comment.eaoStatus = 'Deferred';
    } else if (this.addCommentForm.get('isRejected').value) {
      this.comment.eaoNotes = this.addCommentForm.get('rejectionNotesText').value;
      this.comment.eaoStatus = 'Rejected';
    } else {
      this.comment.eaoStatus = 'Reset';
    }
    this.comment.proponentNotes = this.addCommentForm.get('proponentResponseText').value;

    this.comment.period = this.commentPeriod._id;

    // go through and upload one at a time.
    const documentsForm = this.setDocumentForm();
    this.comment.documentsList = [];
    this.comment.documents = [];

    this.commentService.add(this.comment, documentsForm)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        res => { },
        error => {
          console.error(error);
          alert('Uh-oh, couldn\'t add comment');
        },
        () => { // onCompleted
          this.router.navigate(['/p', this.currentProject._id, 'cp', this.commentPeriod._id]);
          this.loading = false;
          this.openSnackBar('This comment was updated successfuly.', 'Close');
        }
      );
  }

  /**
   * Handle when the user wants to leave the form and stop adding/editing a comment.
   * Navigates the user away from the form if the user confirms they wish to leave.
   * 
   * @return {void}
   */
  public onCancel(): void {
    if (this.commentingMethod === 'externalEngagementTool') {
      this.router.navigate(['/p', this.currentProject._id, 'cp', this.commentPeriod._id]);
    } else if (confirm(`Are you sure you want to discard all changes?`)) {
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
        if (!this.addCommentForm.get('isPublished').value) {
          this.addCommentForm.controls.isPublished.setValue(true);
          this.addCommentForm.controls.isDeferred.setValue(false);
          this.addCommentForm.controls.isRejected.setValue(false);
        } else {
          this.addCommentForm.controls.isPublished.setValue(false);
        }
        break;
      }
      case 'Deferred': {
        if (!this.addCommentForm.get('isDeferred').value) {
          this.addCommentForm.controls.isPublished.setValue(false);
          this.addCommentForm.controls.isDeferred.setValue(true);
          this.addCommentForm.controls.isRejected.setValue(false);
        } else {
          this.addCommentForm.controls.isDeferred.setValue(false);
        }
        break;
      }
      case 'Rejected': {
        if (!this.addCommentForm.get('isRejected').value) {
          this.addCommentForm.controls.isPublished.setValue(false);
          this.addCommentForm.controls.isDeferred.setValue(false);
          this.addCommentForm.controls.isRejected.setValue(true);

          this.documents.forEach(document => {
            document.eaoStatus = 'Rejected';
          });
        } else {
          this.addCommentForm.controls.isRejected.setValue(false);
        }
        break;
      }
      default: {
        // Has no eaoStatus. Probably brand new or has been reset.
        this.addCommentForm.controls.isPublished.setValue(false);
        this.addCommentForm.controls.isDeferred.setValue(false);
        this.addCommentForm.controls.isRejected.setValue(false);
        this.documents.forEach(document => {
          document.eaoStatus = 'Pending';
        });
        break;
      }
    }
  }

  /**
   * Return the async response from the document API for a document download.
   * 
   * @param {Document} document The document object to pass to the API.
   * @returns {Promise<void>}
   */
  public downloadFile(document: Document) {
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
    if (action === 'Published' && !this.addCommentForm.get('isRejected').value) {
      document.eaoStatus = 'Published';
    } else if (action === 'Rejected' && !this.addCommentForm.get('isRejected').value) {
      document.eaoStatus = 'Rejected';
    }
  }

  /**
   * Update the comment form to display all the loaded documents/files.
   * 
   * @returns {Array}
   */
  private setDocumentForm() {
    let docForms = [];
    this.documents.forEach(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProject._id);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('internalOriginalName', doc.internalOriginalName);
      formData.append('documentSource', 'COMMENT');
      formData.append('dateUploaded', moment());
      formData.append('datePosted', moment());
      formData.append('documentAuthor', this.addCommentForm.get('authorText').value);
      // todo add authorType? selector?
      docForms.push(formData);
    });

    return docForms;
  }

  /**
   * Add new documents/files to the comment form.
   * 
   * @param {FileList} files The uploaded files in the form.
   * @return {void}
   */
  public addDocuments(files: FileList): void {
    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list
          if (this.documents.find(x => x.documentFileName === files[i].name)) {
            continue;
          }
          this.commentFiles.push(files[i]);
          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;
          document.internalOriginalName = files[i].name;
          if (this.addCommentForm.get('isRejected').value) {
            document.eaoStatus = 'Rejected';
          }
          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
    }
  }

  /**
   * Delete a file/document from the comment form and from the documents list.
   * 
   * @param {Document} doc The document/file to delete.
   * @return {void}
   */
  public deleteDocument(doc: Document) {
    if (doc && this.documents) { // safety check
      // remove doc from current list
      this.commentFiles = this.commentFiles.filter(item => (item.name !== doc.documentFileName));
      this.documents = this.documents.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }

  /**
   * Opens a new snack bar notification message with a duration of 2 seconds, and executes an action
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
