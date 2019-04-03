import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Document } from 'app/models/document';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  private projectId: string;
  private projectFiles: Document[] = [];
  private documents: Document[] = [];
  public documentDate: NgbDateStruct = null;
  public uploadDate: NgbDateStruct = null;

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // const projectId = route.parent.paramMap.get('projId');
    this.route.parent.paramMap.subscribe(params => {
      this.projectId = params.get('projId');
    });
  }

  public uploadDocuments() {
    // go through and upload one at a time.
    let observables = of(null);

    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.projectId);
      formData.append('type', 'typeDocYay');
      formData.append('milestone', 'milestoneDocYay');
      formData.append('documentDate', moment(this.documentDate));
      formData.append('uploadDate', moment(this.uploadDate));
      formData.append('documentName', 'documentNameDocYay');
      formData.append('documentFileName', doc.documentFileName);
      formData.append('description', 'descriptionDocYay');
      formData.append('labels', 'labelsDocYay');
      formData.append('displayName', doc.documentFileName);
      observables = observables.concat(this.documentService.add(formData));
    });

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
          this.router.navigate(['p', this.projectId, 'project-documents']);
        }
      );
  }

  public addLabel() {
    // TODO: Pop the addLabel modal and assign.

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
