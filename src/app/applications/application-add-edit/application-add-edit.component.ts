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
  private allowDeactivate = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService, // also used in template
    private applicationService: ApplicationService,
    private dialogService: DialogService,
    private searchService: SearchService,
    private decisionService: DecisionService
  ) { }

  // check for unsaved changes before closing (or refreshing) current tab/window
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event) {
    // display browser alert if needed
    if (!this.allowDeactivate && this.applicationForm.dirty) {
      event.returnValue = true;
    }
  }

  // check for unsaved changes before navigating away from current route (ie, this page)
  canDeactivate(): Observable<boolean> | boolean {
    // allow synchronous navigation if everything is OK
    if (this.allowDeactivate || this.applicationForm.pristine) {
      return true;
    }

    // otherwise prompt the user with observable (asynchronous) dialog
    return this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Unsaved Changes',
        message: 'Click OK to discard your changes or Cancel to return to the application.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe);
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
            // make a (deep) copy of the in-memory application so we don't change it
            // this allows us to abort editing
            this.application = _.cloneDeep(data.application);

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
            // (re)load features/shapes
            this.searchService.getByDTID(this.application.tantalisID)
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

                  // populate application properties from first feature
                  if (this.application.features && this.application.features.length > 0) {
                    this.application.purpose = this.application.features[0].properties.TENURE_PURPOSE;
                    this.application.subpurpose = this.application.features[0].properties.TENURE_SUBPURPOSE;
                    this.application.type = this.application.features[0].properties.TENURE_TYPE;
                    this.application.subtype = this.application.features[0].properties.TENURE_SUBTYPE;
                    this.application.status = this.application.features[0].properties.TENURE_STATUS;
                    this.application.tenureStage = this.application.features[0].properties.TENURE_STAGE;
                    this.application.cl_file = +this.application.features[0].properties.CROWN_LANDS_FILE; // NOTE: unary operator
                    this.application.location = this.application.features[0].properties.TENURE_LOCATION;
                    this.application.businessUnit = this.application.features[0].properties.RESPONSIBLE_BUSINESS_UNIT;
                    this.application.tantalisID = this.application.features[0].properties.DISPOSITION_TRANSACTION_SID;
                    this.application.interestID = this.application.features[0].properties.INTRID_SID;
                  }

                  // unset old client
                  this.application.client = null;

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
          console.log('Error retrieving application.');
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
            if (clientString !== this.application.client) {
              this.applicationForm.form.markAsDirty();
            }
            this.application.client = clientString;
          }
        },
        error => {
          console.log('error =', error);
        }
      );
  }

  public createApplication() {
    if (this.applicationForm.invalid) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Create Application',
          message: 'Please check for required fields or errors.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
    } else if (!this.isDispositionValid()) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Create Application',
          message: 'Please check that disposition data (basic information) has been successfully loaded.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
    } else {
      // adjust for current tz
      this.application.publishDate = moment(this.application.publishDate).format();

      this.applicationService.addApplication(this.application)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          application => {
            this.showMessage(false, 'Application created!');
            // reload page so aside updates too
            this.allowDeactivate = true;
            this.router.navigate(['/a', application._id, 'edit']);
            this.applicationForm.form.markAsPristine();
          },
          error => {
            console.log('error =', error);
            this.showMessage(true, 'Error creating application');
          }
        );
    }
  }

  public saveApplication() {
    if (this.applicationForm.invalid) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Save Application',
          message: 'Please check for required fields or errors.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
    } else if (!this.isDispositionValid()) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Save Application',
          message: 'Please check that disposition data (basic information) has been successfully loaded.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
    } else {
      // adjust for current tz
      this.application.publishDate = moment(this.application.publishDate).format();

      // save current application
      this.applicationService.save(this.application)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          application => {
            this.showMessage(false, 'Application saved!');
            this.reloadData(application._id);
          },
          error => {
            console.log('error =', error);
            this.showMessage(true, 'Error saving application');
          }
        );
    }
  }

  private isDispositionValid() {
    return (this.application.features && this.application.features.length > 0
      && this.application.features[0].properties.DISPOSITION_TRANSACTION_SID === this.application.tantalisID);
  }

  public resetApplication() {
    if (this.applicationForm.pristine) {
      this.reloadData(this.application._id);
    } else {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Confirm Reset',
          message: 'Click OK to discard your changes or Cancel to return to the application.'
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe)
        .subscribe(isConfirmed => {
          if (isConfirmed) {
            this.reloadData(this.application._id);
          }
        });
    }
  }

  private reloadData(id: string) {
    // force-reload app data
    this.applicationService.getById(id, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(application => {
        // make a (deep) copy of the in-memory application so we don't change it
        // this allows us to abort editing
        this.application = _.cloneDeep(application);
        this.applicationForm.form.markAsPristine();
      });
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

  publishApplication() {
    if (this.applicationForm.dirty) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Publish Application',
          message: 'Please save pending application changes first.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
    } else if (!this.application.client || !this.application.description) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Publish Application',
          message: 'Please check that client and description have been entered.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
    } else {
      this.applicationService.publish(this.application);
    }
  }

  unPublishApplication() {
    this.applicationService.unPublish(this.application);
  }

  deleteApplication() {
    if (this.application.documents && this.application.documents.length > 0) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Delete Application',
          message: 'Please delete all documents first.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
    } else {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Confirm Deletion',
          message: 'Do you really want to delete this application?'
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe)
        .subscribe((isConfirmed: boolean) => {
          if (isConfirmed) {
            this.applicationService.delete(this.application)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                () => {
                  this.application = null;
                  this.allowDeactivate = true;
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
        title: 'Confirm Deletion',
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
    setTimeout(() => this.showMsg = false, 2000);
  }
}
