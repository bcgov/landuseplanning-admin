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
import { Comment } from 'app/models/comment';
import { Organization } from 'app/models/organization';
import { Feature } from 'app/models/feature';
import { Decision } from 'app/models/decision';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { ApplicationService } from 'app/services/application.service';
import { OrganizationService } from 'app/services/organization.service';
import { SearchService } from 'app/services/search.service';
import { DecisionService } from 'app/services/decision.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';

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
  private daysRemaining = '?';
  private numComments = '?';
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
    private searchService: SearchService,
    private decisionService: DecisionService,
    private commentPeriodService: CommentPeriodService, // used in template
    private commentService: CommentService
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

            //
            // TODO: create separate component for aside items
            //       which can be used here and in application-detail
            //

            // get comment period days remaining
            if (this.application.currentPeriod) {
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const days = moment(this.application.currentPeriod.endDate).diff(moment(today), 'days') + 1;
              this.daysRemaining = days + (days === 1 ? ' Day ' : ' Days ') + 'Remaining';
            }

            // get number of pending comments
            this.commentService.getAllByApplicationId(this.application._id)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                (comments: Comment[]) => {
                  const pending = comments.filter(comment => this.commentService.isPending(comment));
                  const count = pending.length;
                  this.numComments = count.toString();
                },
                error => console.log('couldn\'t get pending comments, error =', error)
              );

            if (!this.application.publishDate) {
              this.application.publishDate = new Date();
            }
            this.application.publishDate = moment(this.application.publishDate).format();
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
    // (re)load the shapes
    // TODO: user needs to SAVE the application
    this.searchService.getByDTID(this.application.tantalisID.toString())
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (features: Feature[]) => {
          this.application.features = features;
          // calculate areaHectares
          let areaHectares = 0;
          _.each(this.application.features, function (f) {
            if (f['properties']) {
              areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
            }
          });
          this.application.areaHectares = areaHectares;
        },
        error => {
          console.log('error =', error);
          this.showMessage(true, 'Error loading shapes');
        }
      );
  }

  selectClient() {
    const self = this;
    let dispId = null;

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
      .subscribe((clientString: string) => {
        if (clientString) {
          self.application.client = clientString;
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

  saveApplication() {
    // adjust for current tz
    this.application.publishDate = moment(this.application.publishDate).format();

    const self = this;
    this.applicationService.save(this.application)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => {
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

  addDecision() {
    const d = new Decision();
    d._application = this.application._id;

    this.decisionService.add(d)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (decision: Decision) => {
          // add succeeded - accept new record
          this.application.decision = decision;
          this.showMessage(false, 'Added decision!');
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
          this.showMessage(false, 'Saved decision!');
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
            (res: Response) => {
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
        (res: Response) => {
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
        (res: Response) => {
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
        (res: Response) => {
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
      .subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          this.decisionService.delete(decision)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              () => {
                this.application.decision = null;
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
    setTimeout(() => this.showMsg = false, 5000);
  }
}
