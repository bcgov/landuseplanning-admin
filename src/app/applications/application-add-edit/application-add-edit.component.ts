import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../../services/api';
import { Application } from '../../models/application';
import { Subscription } from 'rxjs/Subscription';
import { AppComponent } from 'app/app.component';
import { Response } from '@angular/http/src/static_response';
import * as moment from 'moment-timezone';
import { ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Document } from 'app/models/document';
import { DocumentService } from 'app/services/document.service';
import { ApplicationService } from 'app/services/application.service';
import { Constants } from 'app/utils/constants';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-application-add-edit',
  templateUrl: './application-add-edit.component.html',
  styleUrls: ['./application-add-edit.component.scss']
})
export class ApplicationAddEditComponent implements OnInit {
  @ViewChild('fileInput') fileInput;
  public loading: boolean;
  public application: Application;
  public applicationDocuments: Document[];
  private sub: Subscription;
  public types: string[];
  public subtypes: {};
  public purposes: string[];
  public subpurposes: {};
  public statuses: string[];
  private error: boolean;
  private status: string;
  private showMsg: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private documentService: DocumentService,
    private applicationService: ApplicationService
  ) {
    this.applicationDocuments = [];
    this.types = Constants.types;
    this.subtypes = Constants.subtypes;
    this.purposes = Constants.purposes;
    this.subpurposes = Constants.subpurposes;
    this.statuses = Constants.statuses;
    this.showMsg = false;
  }

  typeChange(obj) {
    this.application.subtype = Constants.subtypes[obj][0];
  }

  purposeChange(obj) {
    this.application.subpurpose = Constants.subpurposes[obj][0];
  }

  showMessage(isError, msg) {
    this.error = isError;
    this.showMsg = true;
    this.status = msg;
    const self = this;
    setTimeout(function () {
      self.showMsg = false;
    }, 3000);
  }

  onSubmit() {
    // Adjust for current tz
    this.application.projectDate = moment(this.application.projectDate).format();

    const self = this;
    this.api.saveApplication(this.application)
    .subscribe(
      (data: any) => {
        // console.log('Saved application', data);
        self.showMessage(false, 'Saved Application');
      },
      error => {
        console.log('ERR:', error);
        self.showMessage(true, 'Error saving application');
    });
  }

  upload() {
    const self = this;
    const fileBrowser = this.fileInput.nativeElement;
    console.log('Uploading files:', fileBrowser.files);
    _.each(fileBrowser.files, function (file) {
      if (file) {
        const formData = new FormData();
        formData.append('_application', self.application._id);
        formData.append('displayName', file.name);
        formData.append('upfile', file);
        self.api.uploadDocument(formData)
        .subscribe(
          res => {
          // do stuff w/my uploaded file
          console.log('RES:', res.json());
          self.applicationDocuments.push(res.json());
        },
        error => {
          console.log('error:', error);
        });
      }
    });
  }

  downloadProtectedDocument(file: any) {
    this.api.downloadDocument(file);
  }

  removeDocument(file: any) {
    const self = this;
    this.api.deleteDocument(file)
    .subscribe( res => {
      const doc = res.json();
      // In-memory removal on successful delete.
      _.remove(self.applicationDocuments, function (item) {
        return (item._id === doc._id);
      });
    });
  }

  publishDocument(file: any) {
    const self = this;
    this.api.publishDocument(file)
    .subscribe( res => {
      const doc = res.json();
      const f = _.find(self.applicationDocuments, function (item) {
        return (item._id === doc._id);
      });
      f.isPublished = true;
    });
  }

  unPublishDocument(file: any) {
    const self = this;
    this.api.unPublishDocument(file)
    .subscribe( res => {
      const doc = res.json();
      const f = _.find(self.applicationDocuments, function (item) {
        return (item._id === doc._id);
      });
      f.isPublished = false;
    });
  }

  publishApplication(app) {
    return this.applicationService.publishApplication(app);
  }

  unPublishApplication(app) {
    return this.applicationService.unPublishApplication(app);
  }

  deleteApplication(app) {
    return this.applicationService.deleteApplication(app)
    .subscribe(res => {
      this.router.navigate(['/applications']);
    });
  }

  onChange(event: any, input: any) {
    const files = [].slice.call(event.target.files);
    input.value = files.map(f => f.name).join(', ');
  }

  ngOnInit(): void {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return; // return false;
    }

    this.loading = true;

    // wait for the resolver to retrieve the application details from back-end
    this.sub = this.route.data
      // .finally(() => this.loading = false) // TODO: make this work
      .subscribe(
      (data: { application: Application }) => {
        this.loading = false;
        this.application = data.application;
        if (!this.application.projectDate) {
          this.application.projectDate = new Date();
        }
        this.application.projectDate = moment(this.application.projectDate).format();
        // application not found --> navigate back to application list
        if (!this.application || !this.application._id) {
          console.log('Application not found!');
          this.gotoApplicationList();
        }

        this.documentService.getAllByApplicationId(this.application._id)
        .subscribe((docs: Document[]) => {
          this.applicationDocuments = docs;
        });
      },
      error => {
        this.loading = false;
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        alert('Error loading application');
      });
  }
  private gotoApplicationList(): void {
    this.router.navigate(['/applications']);
  }
}
