import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Document } from 'app/models/document';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import { DocumentService } from 'app/services/document.service';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public currentProjectId: string;
  public authorsel: any;
  public projectFiles: Document[] = [];
  public documents: Document[] = [];
  public documentDate: NgbDateStruct = null;
  public uploadDate: NgbDateStruct = null;
  public doctypes: any[] = [];
  public authors: any[] = [];
  public labels: any[] = [];
  public milestones: any[] = [];  // Get this from the project's data.
  public myForm: FormGroup;

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private config: ConfigService
  ) { }

  ngOnInit() {
    this.route.parent.paramMap.subscribe(params => {
      this.currentProjectId = params.get('projId');
    });
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

    if (this.documentService.state.form) {
      this.myForm = this.documentService.state.form;
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
      let today = new Date();
      let todayObj = {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate()
      };
      this.myForm.controls.documentDate.setValue(todayObj);
      this.myForm.controls.uploadDate.setValue(todayObj);
    }

    if (this.documentService.state.documents) {
      this.documents = this.documentService.state.documents;
    }

    if (this.documentService.state.labels) {
      this.labels = this.documentService.state.labels;
    }
  }

  addLabels() {
    console.log('Adding labels');
    this.documentService.state = { type: 'form', data: this.myForm };
    this.documentService.state = { type: 'documents', data: this.documents };
    this.documentService.state = { type: 'labels', data: this.labels };
    this.router.navigate(['/p', this.currentProjectId, 'project-documents', 'upload', 'add-label']);
  }

  register (myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  public uploadDocuments() {
    // go through and upload one at a time.
    let observables = of(null);

    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProjectId);
      formData.append('type', this.myForm.value.doctypesel);
      formData.append('milestone', this.myForm.value.labelsel);
      formData.append('documentDate', moment(this.myForm.value.documentDate));
      formData.append('uploadDate', moment(this.myForm.value.uploadDate));
      formData.append('documentName', this.myForm.value.documentName || doc.documentFileName);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('description', this.myForm.value.description);
      formData.append('author', this.myForm.value.authorsel);
      formData.append('displayName', doc.documentFileName);
      observables = observables.concat(this.documentService.add(formData));
    });

    this.documentService.state = { type: 'form', data: null };
    this.documentService.state = { type: 'documents', data: null };
    this.documentService.state = { type: 'labels', data: null };

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

  public addDocuments(files: FileList, documents: Document[]) {
    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list

          if (this.documents.find(x => x.documentFileName === files[i].name)) {
            // this.snackBarRef = this.snackBar.open('Can\'t add duplicate file', null, { duration: 2000 });
            continue;
          }

          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;

          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
    }
  }

  public deleteDocument(doc: Document, documents: Document[]) {
    if (doc && documents) { // safety check
      // remove doc from current list
      this.documents = this.documents.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }

}
