import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/concat';
import { of, forkJoin } from 'rxjs';

import { ConfirmComponent } from 'app/confirm/confirm.component';
import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { FeatureService } from 'app/services/feature.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {

  public isPublishing = false;
  public isUnpublishing = false;
  public isDeleting = false;
  public application: Application = null;
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public snackBar: MatSnackBar,
    public api: ApiService, // also used in template
    private dialogService: DialogService,
    public applicationService: ApplicationService, // also used in template
    public commentPeriodService: CommentPeriodService,
    public decisionService: DecisionService,
    public documentService: DocumentService,
    public featureService: FeatureService
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
          } else {
            alert('Uh-oh, couldn\'t load application');
            // application not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );
  }

  ngOnDestroy() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public deleteApplication() {
    if (this.application['numComments'] > 0) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Delete Application',
          message: 'An application with submitted comments cannot be deleted.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
      return;
    }

    if (this.application.isPublished) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Delete Application',
          message: 'Please unpublish application first.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
      return;
    }

    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm Deletion',
        message: 'Do you really want to delete this application?'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.internalDeleteApplication();
          }
        }
      );
  }

  private internalDeleteApplication() {
    this.isDeleting = true;

    let observables = of(null);

    // delete comment period
    if (this.application.currentPeriod) {
      observables = observables.concat(this.commentPeriodService.delete(this.application.currentPeriod));
    }

    // delete decision documents
    if (this.application.decision && this.application.decision.documents) {
      for (const doc of this.application.decision.documents) {
        observables = observables.concat(this.documentService.delete(doc));
      }
    }

    // delete decision
    if (this.application.decision) {
      observables = observables.concat(this.decisionService.delete(this.application.decision));
    }

    // delete application documents
    if (this.application.documents) {
      for (const doc of this.application.documents) {
        observables = observables.concat(this.documentService.delete(doc));
      }
    }

    // delete features
    observables = observables.concat(this.featureService.deleteByApplicationId(this.application._id));

    // delete application
    // do this last in case of prior failures
    observables = observables.concat(this.applicationService.delete(this.application));

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isDeleting = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t delete application');
        },
        () => { // onCompleted
          this.isDeleting = false;
          // delete succeeded --> navigate back to search
          this.router.navigate(['/search']);
        }
      );
  }

  public publishApplication() {
    if (!this.application.description) {
      this.dialogService.addDialog(ConfirmComponent,
        {
          title: 'Cannot Publish Application',
          message: 'A description for this application is required to publish.',
          okOnly: true
        }, {
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe);
      return;
    }

    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm Publish',
        message: 'Publishing this application will make it visible to the public. Are you sure you want to proceed?'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.internalPublishApplication();
          }
        }
      );
  }

  private internalPublishApplication() {
    this.isPublishing = true;

    let observables = of(null);

    // publish comment period
    if (this.application.currentPeriod && !this.application.currentPeriod.isPublished) {
      observables = observables.concat(this.commentPeriodService.publish(this.application.currentPeriod));
    }

    // publish decision documents
    if (this.application.decision && this.application.decision.documents) {
      for (const doc of this.application.decision.documents) {
        if (!doc.isPublished) {
          observables = observables.concat(this.documentService.publish(doc));
        }
      }
    }

    // publish decision
    if (this.application.decision && !this.application.decision.isPublished) {
      observables = observables.concat(this.decisionService.publish(this.application.decision));
    }

    // publish application documents
    if (this.application.documents) {
      for (const doc of this.application.documents) {
        if (!doc.isPublished) {
          observables = observables.concat(this.documentService.publish(doc));
        }
      }
    }

    // publish application
    // do this last in case of prior failures
    if (!this.application.isPublished) {
      observables = observables.concat(this.applicationService.publish(this.application));
    }

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isPublishing = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t publish application');
        },
        () => { // onCompleted
          this.snackBarRef = this.snackBar.open('Application published...', null, { duration: 2000 });
          // reload all data
          this.applicationService.getById(this.application._id, { getFeatures: true, getDocuments: true, getCurrentPeriod: true, getDecision: true })
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              application => {
                this.isPublishing = false;
                this.application = application;
              },
              error => {
                this.isPublishing = false;
                console.log('error =', error);
                alert('Uh-oh, couldn\'t reload application');
              }
            );
        }
      );
  }

  public unPublishApplication() {
    this.isUnpublishing = true;

    let observables = of(null);

    // unpublish comment period
    if (this.application.currentPeriod && this.application.currentPeriod.isPublished) {
      observables = observables.concat(this.commentPeriodService.unPublish(this.application.currentPeriod));
    }

    // unpublish decision documents
    if (this.application.decision && this.application.decision.documents) {
      for (const doc of this.application.decision.documents) {
        if (doc.isPublished) {
          observables = observables.concat(this.documentService.unPublish(doc));
        }
      }
    }

    // unpublish decision
    if (this.application.decision && this.application.decision.isPublished) {
      observables = observables.concat(this.decisionService.unPublish(this.application.decision));
    }

    // unpublish application documents
    if (this.application.documents) {
      for (const doc of this.application.documents) {
        if (doc.isPublished) {
          observables = observables.concat(this.documentService.unPublish(doc));
        }
      }
    }

    // unpublish application
    // do this last in case of prior failures
    if (this.application.isPublished) {
      observables = observables.concat(this.applicationService.unPublish(this.application));
    }

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isUnpublishing = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t unpublish application');
        },
        () => { // onCompleted
          this.snackBarRef = this.snackBar.open('Application unpublished...', null, { duration: 2000 });
          // reload all data
          this.applicationService.getById(this.application._id, { getFeatures: true, getDocuments: true, getCurrentPeriod: true, getDecision: true })
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              application => {
                this.isUnpublishing = false;
                this.application = application;
              },
              error => {
                this.isUnpublishing = false;
                console.log('error =', error);
                alert('Uh-oh, couldn\'t reload application');
              }
            );
        }
      );
  }

}
