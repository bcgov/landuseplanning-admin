import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfigService } from 'app/services/config.service';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';

import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public documents: any[] = [];
  public currentProject;
  public myForm: FormGroup;
  public authors: any[] = [];
  public labels: any[] = [];
  public datePosted: NgbDateStruct = null;
  public isPublished = false;
  public loading = true;
  public multiEdit = false;
  public docNameInvalid = false;
  public PROJECT_PHASES: Array<Object> = [
    'Pre-Planning',
    'Plan Initiation',
    'Plan Development',
    'Plan Evaluation and Approval',
    'Plan Implementation and Monitoring'
  ];

  constructor(
    private config: ConfigService,
    private documentService: DocumentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router,
    private storageService: StorageService,
    private utils: Utils
  ) { }

  /**
   * Get project and project documents(files) from local storage.
   * Set up the configuration for authors and labels. Set up the project
   * documents add/edit form.
   * 
   * @return {void}
   */
  ngOnInit() {
    this.documents = this.storageService.state.selectedDocs;
    this.currentProject = this.storageService.state.currentProject.data;

    this.config.lists.forEach(item => {
      switch (item.type) {
        case 'author':
          this.authors.push(Object.assign({}, item));
          break;
        case 'label':
          this.labels.push(Object.assign({}, item));
          break;
        case 'projectPhase':
          break;
      }
    });

    // Check if documents are null (nav straight to this page)
    if (!this.documents || this.documents.length === 0) {
      this.router.navigate(['p', this.currentProject._id, 'project-files']);
    } else {
      if (this.storageService.state.form) {
        this.myForm = this.storageService.state.form;
      } else {
        if (this.documents.length === 1) {
          this.isPublished = this.documents[0].read.includes('public');
          // Set the old data in there if it exists.
          this.myForm = new FormGroup({
            'documentAuthor': new FormControl(this.documents[0].documentAuthor, Validators.required),
            'datePosted': new FormControl(this.utils.convertJSDateToNGBDate(new Date(this.documents[0].datePosted)), Validators.required),
            'displayName': new FormControl(this.documents[0].displayName, Validators.required),
            'description': new FormControl(this.documents[0].description, Validators.required),
            'projectPhase': new FormControl(this.documents[0].projectPhase, Validators.required)

          });
        } else {
          this.multiEdit = true;
          this.myForm = new FormGroup({
            'documentAuthor': new FormControl('', Validators.required),
            'datePosted': new FormControl('', Validators.required),
            'displayName': new FormControl('', Validators.required),
            'description': new FormControl('', Validators.required),
            'projectPhase': new FormControl('', Validators.required)
          });
        }
      }

      this._changeDetectionRef.detectChanges();

      if (this.storageService.state.labels) {
        // this.labels = this.storageService.state.labels;
      }
    }
    this.loading = false;
  }

  /**
   * If local storage has a previous router location, navigate the user to it,
   * otherwise, navigate the user to the "project files" view.
   * 
   * @return {void}
   */
  goBack() {
    if (this.storageService.state.back && this.storageService.state.back.url) {
      this.router.navigate(this.storageService.state.back.url);
    } else {
      this.router.navigate(['/p', this.currentProject._id, 'project-files']);
    }
  }

  /**
   * Make sure the document name doesn't include any invalid characters
   * (that wouldn't work within a URL, for example).
   * 
   * @return {void}
   */
  public validateChars() {
    if (this.myForm.value.displayName.match(/[\/|\\:*?"<>]/g)) {
      this.docNameInvalid = true;
    } else {
      this.docNameInvalid = false;
    }
  }

  /**
   * On multi edit save, check if date form controls have valid date values.
   * 
   * @param {NgbDate} formValue The form control date to check.
   * @param {Date} docValue The doc date value to check.
   * @param {boolean} isDate If the form value to check is a date.
   * @returns {NgbDate|Date}
   */
  multiEditGetUpdatedValue(formValue, docValue, isDate = false) {
    if (formValue !== null) {
      if (isDate) {
        return new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(formValue))).toISOString();
      } else {
        return formValue;
      }
    } else {
      return docValue;
    }
  }

  /**
   * Save the project documents by preparing the form data, then contacting
   * the document API. Multiple documents can be saved at once.
   * 
   * @return {void}
   */
  save() {
    this.loading = true;

    // Save all the elements to all the documents.
    // go through and upload one at a time.
    let observables = [];

    let theLabels = this.labels.filter(label => {
      return label.selected === true;
    });

    this.documents.forEach(doc => {
      const formData = new FormData();
      formData.append('project', this.currentProject._id);
      formData.append('documentSource', 'PROJECT');

      if (!this.multiEdit) {
        doc.documentFileName !== null ? formData.append('documentFileName', doc.documentFileName) : Function.prototype;
        this.myForm.value.documentAuthor !== null ? formData.append('documentAuthor', this.myForm.value.documentAuthor) : Function.prototype;
        this.myForm.value.description !== null ? formData.append('description', this.myForm.value.description) : Function.prototype;
        this.myForm.value.displayName !== null ? formData.append('displayName', this.myForm.value.displayName) : Function.prototype;
        formData.append('datePosted', new Date(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('datePosted').value))).toISOString());
        formData.append('documentAuthorType', this.myForm.value.authorsel);
        formData.append('projectPhase', this.myForm.value.projectPhase);
      } else {
        doc.documentFileName !== null ? formData.append('documentFileName', doc.documentFileName) : Function.prototype;
        doc.documentAuthor !== null ? formData.append('documentAuthor', doc.documentAuthor) : Function.prototype;
        doc.displayName !== null ? formData.append('displayName', doc.displayName) : Function.prototype;
        doc.description !== null ? formData.append('description', doc.description) : Function.prototype;
        doc.projectPhase !== null ? formData.append('projectPhase', doc.projectPhase) : Function.prototype;

        // apply changes to datePosted if any
        let datePosted = this.multiEditGetUpdatedValue(this.myForm.value.datePosted, doc.datePosted, true);
        datePosted !== undefined && datePosted !== null ? formData.append('datePosted', datePosted) : Function.prototype;
      }

      // TODO
      formData.append('labels', JSON.stringify(theLabels));
      observables.push(this.documentService.update(formData, doc._id));
    });

    this.multiEdit = false;
    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };
    this.storageService.state = { type: 'labels', data: null };


    forkJoin(observables)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (d) => { // onNext
          // Push the new version of documents into the selected list.
          this.storageService.state.selectedDocs = d;
        },
        error => {
          console.error(error);
          alert('Uh-oh, couldn\'t delete project');
          // TODO: should fully reload project here so we have latest non-deleted objects
        },
        () => { // onCompleted
          // Set new state for docs.
          this.storageService.state = { type: 'documents', data: this.storageService.state.selectedDocs };
          // Clear out the document state that was stored previously.
          this.goBack();
          this.loading = false;
        }
      );
  }

  /**
   * Save the user's changes to the document edit view, then navigate them
   * to the "add labels" view.
   * 
   * @return {void}
   */
  addLabels() {
    this.storageService.state = { type: 'form', data: this.myForm };
    this.storageService.state = { type: 'labels', data: this.labels };
    this.storageService.state.back = { url: ['/p', this.currentProject._id, 'project-files', 'edit'], label: 'Edit File(s)' };
    this.router.navigate(['/p', this.currentProject._id, 'project-files', 'edit', 'add-label']);
  }

  public togglePublish() {
    this.isPublished = !this.isPublished;
    let observables = [];
    this.documents.forEach(doc => {
      if (this.isPublished) {
        observables.push(this.documentService.publish(doc._id));
      } else {
        observables.push(this.documentService.unPublish(doc._id));
      }
      forkJoin(observables)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { // onNext
            // do nothing here - see onCompleted() function below
          },
          error => {
            console.error(error);
            alert('Uh-oh, couldn\'t update document\'s publish status');
            // TODO: should fully reload project here so we have latest non-deleted objects
          },
          () => { // onCompleted
            if (this.isPublished) {
              this.openSnackBar('This document has been published.', 'Close');
            } else {
              this.openSnackBar('This document has been unpublished.', 'Close');
            }
          }
        );
    });
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
