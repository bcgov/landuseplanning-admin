import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import * as moment from 'moment-timezone';
import { Subject } from 'rxjs';

import { StorageService } from 'app/services/storage.service';
import { ConfigService } from 'app/services/config.service';
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public documents: any[] = [];
  public currentProjectId: any;
  public myForm: FormGroup;
  public doctypes: any[] = [];
  public authors: any[] = [];
  public labels: any[] = [];
  public documentDate: NgbDateStruct = null;
  public uploadDate: NgbDateStruct = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private config: ConfigService,
    private documentService: DocumentService,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.route.parent.paramMap.subscribe(params => {
      this.currentProjectId = params.get('projId');
    });

    this.documents = this.storageService.state.selectedDocs;

    // Check if documents are null (nav straight to this page)
    if (!this.documents || this.documents.length === 0) {
      this.router.navigate(['p', this.currentProjectId, 'project-documents']);
    } else {
      this.config.lists.map(item => {
        switch (item.type) {
          case 'doctype':
            this.doctypes.push(Object.assign({}, item));
            break;
          case 'author':
            this.authors.push(Object.assign({}, item));
            break;
          case 'label':
            this.labels.push(Object.assign({}, item));
            break;
        }
      });

      if (this.storageService.state.form) {
        this.myForm = this.storageService.state.form;
      } else {
        if (this.documents.length === 1) {
          // Set the old data in there if it exists.
          this.myForm = new FormGroup({
            'doctypesel': new FormControl(this.documents[0].type),
            'authorsel': new FormControl(this.documents[0].documentAuthor),
            'labelsel': new FormControl(this.documents[0].milestone),
            'documentDate': new FormControl(this.documents[0].documentDate),
            'uploadDate': new FormControl(this.documents[0].uploadDate),
            'documentName': new FormControl(this.documents[0].documentName),
            'description': new FormControl(this.documents[0].description)
          });
        } else {
          this.myForm = new FormGroup({
            'doctypesel': new FormControl(),
            'authorsel': new FormControl(),
            'labelsel': new FormControl(),
            'documentDate': new FormControl(),
            'uploadDate': new FormControl(),
            'documentName': new FormControl(),
            'description': new FormControl()
          });
        }
        let today = new Date();
        let todayObj = {
          year: today.getFullYear(),
          month: today.getMonth(),
          day: today.getDate()
        };
        this.myForm.controls.documentDate.setValue(todayObj);
        this.myForm.controls.uploadDate.setValue(todayObj);
      }

      if (this.storageService.state.labels) {
        // this.labels = this.storageService.state.labels;
      }
    }
  }

  save() {
    // Save all the elements to all the documents.
    console.log('this.myForm:', this.myForm);
    // go through and upload one at a time.
    let observables = of(null);

    let theLabels = this.labels.filter(label => {
      return label.selected === true;
    });

    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('project', this.currentProjectId);
      formData.append('type', this.myForm.value.doctypesel);
      formData.append('documentSource', 'PROJECT');
      formData.append('milestone', this.myForm.value.labelsel);
      formData.append('documentDate', moment(this.myForm.value.documentDate));
      formData.append('uploadDate', moment(this.myForm.value.uploadDate));
      formData.append('documentName', this.myForm.value.documentName || doc.documentFileName);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('description', this.myForm.value.description);
      formData.append('documentAuthor', this.myForm.value.authorsel);
      formData.append('displayName', doc.documentName);
      formData.append('internalOriginalName', doc.documentFileName);
      formData.append('labels', JSON.stringify(theLabels));
      observables = observables.concat(this.documentService.update(formData, doc._id));
    });

    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };
    this.storageService.state = { type: 'labels', data: null };

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          console.log('error =', error);
          alert('Uh-oh, couldn\'t delete project');
          // TODO: should fully reload project here so we have latest non-deleted objects
        },
        () => { // onCompleted
          // delete succeeded --> navigate back to search
          // Clear out the document state that was stored previously.
          this.router.navigate(['p', this.currentProjectId, 'project-documents']);
        }
      );
  }

  addLabels() {
    console.log('Adding labels');
    this.storageService.state = { type: 'form', data: this.myForm };
    this.storageService.state = { type: 'labels', data: this.labels };
    this.storageService.state.back = { url: ['/p', this.currentProjectId, 'project-documents', 'edit'], label: 'Edit Document(s)'};
    this.router.navigate(['/p', this.currentProjectId, 'project-documents', 'edit', 'add-label']);
  }

  register (myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

}
