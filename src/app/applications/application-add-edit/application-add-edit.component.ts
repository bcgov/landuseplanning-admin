import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Feature } from 'app/models/feature';
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
  public types = Constants.types;
  public subtypes = Constants.subtypes;
  public purposes = Constants.purposes;
  public subpurposes = Constants.subpurposes;
  public statuses = Constants.statuses;

  public application: Application = null;
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  applyDisposition() {
    // // Fetch the new feature data, update current UI.
    // this.searchService.getByDTID(this.application.tantalisID.toString())
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe((features: Feature[]) => {
    //     this.application.features = features;
    //   });

    // reload cached app data
    this.applicationService.getById(this.application._id, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((application: Application) => {
        this.application = application;
      });
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
      .subscribe((selectedOrgId: string) => {
        if (selectedOrgId) {
          // Fetch the org from the service, and bind to this instance of an application.
          self.orgService.getById(selectedOrgId)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              (org: Organization) => {
                self.application.organization = new Organization(org);
                // Update current reference.
                self.application._organization = org._id;
              },
              error => {
                console.log('error =', error);
              }
            );
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
    // adjust for current tz
    this.application.projectDate = moment(this.application.projectDate).format();

    const self = this;
    this.applicationService.save(this.application)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (app: Application) => {
          // console.log('application =', app);
          self.showMessage(false, 'Saved application!');
          // reload cached app data
          this.applicationService.getById(this.application._id, true)
            .takeUntil(this.ngUnsubscribe)
            .subscribe();
        },
        error => {
          console.log('error =', error);
          self.showMessage(true, 'Error saving application');
        }
      );
  }

  uploadFiles(fileList: FileList, documents: Document[]) {
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i]) {
        const formData = new FormData();
        if (documents === this.application.documents) {
          formData.append('_application', this.application._id);
        } else if (documents === this.application.decision.documents) {
          formData.append('_decision', this.application.decision._id);
        } else {
          break; // error
        }
        formData.append('displayName', fileList[i].name);
        formData.append('upfile', fileList[i]);
        this.api.uploadDocument(formData)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (doc: Response) => {
              // add uploaded file to specified document array
              documents.push(doc.json());
            },
            error => {
              console.log('error =', error);
            }
          );
      }
    }
  }

  publishDocument(document: Document, documents: Document[]) {
    this.api.publishDocument(document) // TODO: should call service instead of API
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        const doc = res.json();
        const f = _.find(documents, function (item) {
          return (item._id === doc._id);
        });
        f.isPublished = true;
      });
  }

  unPublishDocument(document: Document, documents: Document[]) {
    this.api.unPublishDocument(document) // TODO: should call service instead of API
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        const doc = res.json();
        const f = _.find(documents, function (item) {
          return (item._id === doc._id);
        });
        f.isPublished = false;
      });
  }

  removeDocument(document: Document, documents: Document[]) {
    this.api.deleteDocument(document) // TODO: should call service instead of API
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        const doc = res.json();
        // remove file from specified document array
        _.remove(documents, function (item) {
          return (item._id === doc._id);
        });
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
      .subscribe((isConfirmed: boolean) => {
        // we get dialog result
        if (isConfirmed) {
          this.applicationService.delete(app)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(res => {
              this.router.navigate(['/applications']);
            });
        }
      });
  }

  private showMessage(isError, msg) {
    this.error = isError;
    this.showMsg = true;
    this.status = msg;
    setTimeout(() => this.showMsg = false, 5000);
  }
}
