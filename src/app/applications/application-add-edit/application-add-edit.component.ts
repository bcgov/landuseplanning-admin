import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http/src/static_response';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

import { Constants } from 'app/utils/constants';
import { SelectOrganizationComponent } from 'app/applications/select-organization/select-organization.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { ApplicationAsideComponent } from 'app/applications/application-aside/application-aside.component';
import { Application } from 'app/models/application';
import { Document } from 'app/models/document';
import { Comment } from 'app/models/comment';
import { Organization } from 'app/models/organization';
import { Feature } from 'app/models/feature';
import { Decision } from 'app/models/decision';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { SearchService } from 'app/services/search.service';
import { DecisionService } from 'app/services/decision.service';

@Component({
  selector: 'app-application-add-edit',
  templateUrl: './application-add-edit.component.html',
  styleUrls: ['./application-add-edit.component.scss']
})
export class ApplicationAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('applicationForm') applicationForm: NgForm;
  @ViewChild(ApplicationAsideComponent) applicationAside: ApplicationAsideComponent;

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
  private isCanceling = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService, // also used in template
    private applicationService: ApplicationService,
    private dialogService: DialogService,
    private searchService: SearchService,
    private decisionService: DecisionService
  ) { }

  // check for unsaved changes before closing (or refreshing) tab/window
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event) {
    if (this.applicationForm.dirty) {
      event.returnValue = true;
    }
  }

  // check for unsaved changes before navigating away from current route (ie, page)
  canDeactivate(): Observable<boolean> | boolean {
    // allow synchronous navigation if everything is OK
    if (this.isCanceling || !this.applicationForm.dirty) {
      return true;
    }

    // otherwise prompt the user with observable (asynchronous) dialog
    return this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Unsaved changes',
        message: 'Click OK to discard your changes or Cancel to return to the application.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      }
    );
  }

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

            if (!this.application.publishDate) {
              this.application.publishDate = new Date();
            }
            this.application.publishDate = moment(this.application.publishDate).format();
          } else {
            // application not found --> navigate back to application list
            alert('Uh-oh, couldn\'t load application');
            this.router.navigate(['/applications']);
          }
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public launchMap() {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it.
    const appId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: appId }]);
  }

  applyDisposition() {
    // (re)load the shapes

    // first check if the disp is already used by another application
    this.applicationService.getByTantalisId(this.application.tantalisID)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        application => {
          if (application && application._id !== this.application._id) {
            // found it
            this.dialogService.addDialog(ConfirmComponent,
              {
                title: 'Disposition Already Exists',
                message: 'This Disposition already exists in a Public Review &amp; Comment application.'
                  + ' Click OK to go to the existing application, or Cancel to return to the current application.'
              }, {
                backdropColor: 'rgba(0, 0, 0, 0.5)'
              })
              .takeUntil(this.ngUnsubscribe)
              .subscribe(isConfirmed => {
                if (isConfirmed) {
                  // go to the other application
                  this.router.navigate(['/a', application._id]);
                }
                // otherwise return to current application
              });
          } else {
            // fall through: (re)load data
            this.searchService.getByDTID(this.application.tantalisID.toString())
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                features => {
                  this.application.features = features;
                  // calculate Total Area (hectares)
                  let areaHectares = 0;
                  _.each(this.application.features, function (f) {
                    if (f['properties']) {
                      areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
                    }
                  });
                  this.application.areaHectares = areaHectares;

                  // copy over application info from first feature
                  if (this.application.features && this.application.features.length > 0) {
                    this.application.purpose = this.application.features[0].properties.TENURE_PURPOSE;
                    this.application.subpurpose = this.application.features[0].properties.TENURE_SUBPURPOSE;
                    this.application.type = this.application.features[0].properties.TENURE_TYPE;
                    this.application.subtype = this.application.features[0].properties.TENURE_SUBTYPE;
                    this.application.status = this.application.features[0].properties.TENURE_STATUS;
                    this.application.cl_file = +this.application.features[0].properties.CROWN_LANDS_FILE; // NOTE: unary operator
                    this.application.location = this.application.features[0].properties.TENURE_LOCATION;
                    this.application.businessUnit = this.application.features[0].properties.RESPONSIBLE_BUSINESS_UNIT;
                  }

                  this.applicationAside.drawMap(this.application);
                },
                error => {
                  console.log('error =', error);
                  this.showMessage(true, 'Error loading shapes');
                }
              );
          }
        },
        error => {
          console.log('Error retreiving applications.');
        }
      );
  }

  selectClient() {
    let dispId: number = null;

    if (this.application && this.application.tantalisID) {
      dispId = this.application.tantalisID;
    }
    this.dialogService.addDialog(SelectOrganizationComponent,
      {
        dispositionId: dispId
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        clientString => {
          if (clientString && clientString.length > 0) {
            this.application.client = clientString;
          }
        },
        error => {
          console.log('error =', error);
        }
      );
  }

  saveApplication() {
    // adjust for current tz
    this.application.publishDate = moment(this.application.publishDate).format();

    if (this.application._id === '0') {
      // create new application
      // then reload the page
      console.log('application = ', this.application);
      this.applicationService.addApplication(this.application)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          application => {
            console.log('added application = ', application);
            this.router.navigate(['/a', application._id, 'edit']);
          },
          error => {
            console.log('error =', error);
            this.showMessage(true, 'Error adding application');
          }
        );
    } else {
      // save current application
      this.applicationService.save(this.application)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => {
            this.showMessage(false, 'Application saved!');
            // reload cached app data
            this.applicationService.getById(this.application._id, true)
              .takeUntil(this.ngUnsubscribe)
              .subscribe();
          },
          error => {
            console.log('error =', error);
            this.showMessage(true, 'Error saving application');
          }
        );
    }
  }

  cancelApplication() {
    this.isCanceling = true;
    this.router.navigate(['/applications']);
  }

  addDecision() {
    const d = new Decision();
    d._application = this.application._id;

    this.decisionService.add(d)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        decision => {
          // add succeeded - accept new record
          this.application.decision = decision;
          this.showMessage(false, 'Decision added!');
        },
        error => {
          console.log('error =', error);
          this.showMessage(true, 'Error adding decision');
        }
      );
  }

  saveDecision() {
    this.decisionService.save(this.application.decision)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => {
          // save succeeded
          // just hold on to existing decision instead of reloading it
          this.showMessage(false, 'Decision saved!');
        },
        error => {
          console.log('error =', error);
          this.showMessage(true, 'Error saving decision');
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
            res => {
              // add uploaded file to specified document array
              documents.push(res.json());
            },
            error => {
              console.log('error =', error);
              this.showMessage(true, 'Error uploading file');
            }
          );
      }
    }
  }

  publishDocument(document: Document, documents: Document[]) {
    this.api.publishDocument(document) // TODO: should call service instead of API
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        res => {
          const doc = res.json();
          const f = _.find(documents, function (item) {
            return (item._id === doc._id);
          });
          f.isPublished = true;
        },
        error => {
          console.log('error =', error);
          this.showMessage(true, 'Error publishing document');
        }
      );
  }

  unPublishDocument(document: Document, documents: Document[]) {
    this.api.unPublishDocument(document) // TODO: should call service instead of API
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        res => {
          const doc = res.json();
          const f = _.find(documents, function (item) {
            return (item._id === doc._id);
          });
          f.isPublished = false;
        },
        error => {
          console.log('error =', error);
          this.showMessage(true, 'Error un-publishing document');
        }
      );
  }

  deleteDocument(document: Document, documents: Document[]) {
    this.api.deleteDocument(document) // TODO: should call service instead of API
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        res => {
          const doc = res.json();
          // remove file from specified document array
          _.remove(documents, function (item) {
            return (item._id === doc._id);
          });
        },
        error => {
          console.log('error =', error);
          this.showMessage(true, 'Error deleting document');
        }
      );
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
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          this.applicationService.delete(app)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              () => {
                this.application = null;
                this.router.navigate(['/applications']);
              },
              error => {
                console.log('error =', error);
                this.showMessage(true, 'Error deleting application');
              }
            );
        }
      });
  }

  publishDecision(decision: Decision) {
    this.decisionService.publish(decision);
  }

  unPublishDecision(decision: Decision) {
    this.decisionService.unPublish(decision);
  }

  deleteDecision(decision: Decision) {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm deletion',
        message: 'Do you really want to delete this decision?'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isConfirmed => {
        if (isConfirmed) {
          this.decisionService.delete(decision)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              () => {
                this.application.decision = null;
                this.showMessage(false, 'Decision deleted!');
              },
              error => {
                console.log('error =', error);
                this.showMessage(true, 'Error deleting decision');
              }
            );
        }
      });
  }

  private showMessage(isError, msg) {
    this.error = isError;
    this.showMsg = true;
    this.status = msg;
    setTimeout(() => this.showMsg = false, 3000);
  }
}
