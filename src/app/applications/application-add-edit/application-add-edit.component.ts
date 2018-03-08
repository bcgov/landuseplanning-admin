import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http/src/static_response';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

import { Constants } from 'app/utils/constants';
import { AppComponent } from 'app/app.component';
import { SelectOrganizationComponent } from '../select-organization/select-organization.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { Application } from 'app/models/application';
import { Document } from 'app/models/document';
import { Organization } from 'app/models/organization';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { ApplicationService } from 'app/services/application.service';
import { OrganizationService } from 'app/services/organization.service';
import { SearchService } from 'app/services/search.service';

@Component({
  selector: 'app-application-add-edit',
  templateUrl: './application-add-edit.component.html',
  styleUrls: ['./application-add-edit.component.scss']
})
export class ApplicationAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') private fileInput;

  public types = Constants.types;
  public subtypes = Constants.subtypes;
  public purposes = Constants.purposes;
  public subpurposes = Constants.subpurposes;
  public statuses = Constants.statuses;

  public fileList: FileList;
  public application: Application = null;
  public applicationDocuments: Array<Document> = [];
  public error = false;
  public showMsg = false;
  public status: string;
  public clFile: number = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService, // also used in template
    private documentService: DocumentService,
    private orgService: OrganizationService,
    private applicationService: ApplicationService,
    private dialogService: DialogService,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            this.application = data.application;

            if (!this.application.projectDate) {
              this.application.projectDate = new Date();
            }
            this.application.projectDate = moment(this.application.projectDate).format();

            // TODO: this should be cleaned up (does this in service already) -- see list page for example
            this.documentService.getAllByApplicationId(this.application._id)
              .subscribe((documents: Document[]) => {
                this.applicationDocuments = documents;
              });

            if (this.application._organization) {
              this.orgService.getById(this.application._organization)
                .subscribe((organization: Organization) => {
                  this.application.organization = organization;
                });
            }
          } else {
            // application not found --> navigate back to application list
            alert('Uh-oh, couldn\'t load application');
            this.router.navigate(['/applications']);
          }
        },
        error => {
          console.log(error);
          alert('Uh-oh, couldn\'t load application');
          this.router.navigate(['/applications']);
        }
      );
  }

  applyDisposition() {
    // Fetch the new feature data, update current UI.
    this.searchService.getByDTID(this.application.tantalisID.toString())
      .subscribe(data => {
        this.application.features = data;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  fileChange(event) {
    this.fileList = event.target.files;
  }

  typeChange(obj) {
    this.application.subtype = Constants.subtypes[obj][0];
  }

  purposeChange(obj) {
    this.application.subpurpose = Constants.subpurposes[obj][0];
  }

  selectClient() {
    const self = this;
    let orgId = null;
    if (this.application.organization) {
      orgId = this.application.organization._id;
    }
    this.dialogService.addDialog(SelectOrganizationComponent,
      {
        selectedOrgId: orgId
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe((selectedOrgId) => {
        if (selectedOrgId) {
          // Fetch the org from the service, and bind to this instance of an application.
          self.orgService.getById(selectedOrgId)
            .subscribe(
              data => {
                self.application.organization = new Organization(data);
                // Update current reference.
                self.application._organization = data._id;
              },
              error => {
                console.log('error =', error);
              });
        } else {
          console.log('org selection cancelled');
        }
      });
  }

  addCLFile() {
    if (this.application.cl_files === null) {
      this.application.cl_files = [];
    }
    this.application.cl_files.push(this.clFile);
    this.clFile = null;
  }

  removeCLFile(clFile) {
    _.remove(this.application.cl_files, function (item) {
      return (item === clFile);
    });
  }

  onSubmit() {
    // Adjust for current tz
    this.application.projectDate = moment(this.application.projectDate).format();

    const self = this;
    this.api.saveApplication(this.application)
      .subscribe(
        (application) => {
          // console.log('application =', application);
          self.showMessage(false, 'Saved application!');
          // Update the shape data
          self.applyDisposition();
        },
        error => {
          console.log('error =', error);
          self.showMessage(true, 'Error saving application');
        });
  }

  private showMessage(isError, msg) {
    this.error = isError;
    this.showMsg = true;
    this.status = msg;
    setTimeout(() => this.showMsg = false, 5000);
  }

  uploadFiles() {
    const self = this;
    const fileList = Object.assign({}, this.fileList); // copy of files
    this.fileInput.nativeElement.value = ''; // clear input

    _.each(fileList, function (file) {
      if (file) {
        const formData = new FormData();
        formData.append('_application', self.application._id);
        formData.append('displayName', file.name);
        formData.append('upfile', file);
        self.api.uploadDocument(formData)
          .subscribe(
            (document) => {
              // do stuff w/my uploaded file
              console.log('document =', document.json());
              self.applicationDocuments.push(document.json());
            },
            error => {
              console.log('error =', error);
            });
      }
    });
  }

  removeDocument(document: Document) {
    const self = this;
    this.api.deleteDocument(document) // TODO: should call service instead of API
      .subscribe(res => {
        const doc = res.json();
        // In-memory removal on successful delete.
        _.remove(self.applicationDocuments, function (item) {
          return (item._id === doc._id);
        });
      });
  }

  publishDocument(document: Document) {
    const self = this;
    this.api.publishDocument(document)
      .subscribe(res => {
        const doc = res.json();
        const f = _.find(self.applicationDocuments, function (item) {
          return (item._id === doc._id);
        });
        f.isPublished = true;
      });
  }

  unPublishDocument(document: Document) {
    const self = this;
    this.api.unPublishDocument(document)
      .subscribe(res => {
        const doc = res.json();
        const f = _.find(self.applicationDocuments, function (item) {
          return (item._id === doc._id);
        });
        f.isPublished = false;
      });
  }

  publishApplication(app: Application) {
    this.applicationService.publish(app);
  }

  unPublishApplication(app: Application) {
    this.applicationService.unPublish(app);
  }

  deleteApplication(app: Application) {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm deletion',
        message: 'Do you really want to delete this application?'
      }, {
        // index: 0,
        // autoCloseTimeout: 10000,
        // closeByClickingOutside: true,
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe((isConfirmed) => {
        // we get dialog result
        if (isConfirmed) {
          this.applicationService.delete(app)
            .subscribe(res => {
              this.router.navigate(['/applications']);
            });
        }
      });
  }
}
