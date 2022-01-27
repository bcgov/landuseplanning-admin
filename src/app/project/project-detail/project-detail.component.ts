import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/concat';
import { of } from 'rxjs';

import { NgxSmartModalService } from 'ngx-smart-modal';

import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})

export class ProjectDetailComponent implements OnInit, OnDestroy {

  public isPublishing = false;
  public isUnpublishing = false;
  public isDeleting = false;
  public project: Project = null;
  public visibility: string;
  public multipleExistingPlans: boolean;
  public overlappingDistrictsListString: string;
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    public api: ApiService, // also used in template
    private _changeDetectorRef: ChangeDetectorRef,
    public projectService: ProjectService, // also used in template
    public commentPeriodService: CommentPeriodService,
    public decisionService: DecisionService,
    private storageService: StorageService,
    public documentService: DocumentService,
    private ngxSmartModalService: NgxSmartModalService
  ) {
  }

  /**
   * Init component.
   *
   * @returns {undefined}
   */
  ngOnInit() {
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { project: Project }) => {
          if (data.project) {
            this.project = data.project;
            this.multipleExistingPlans = Array.isArray(this.project.existingLandUsePlans);
            this.overlappingDistrictsListString = this.stringifyOverlappingDistricts(this.project.overlappingRegionalDistricts as string | string[]);
            this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
            this.project.read.includes('public') ? this.visibility = "Published" : this.visibility = "Not Published";
            this._changeDetectorRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );

    this.ngxSmartModalService.getModal('confirmation-modal').onAnyCloseEventFinished
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        const data = this.ngxSmartModalService.getModalData('confirmation-modal');
        this.projectActions(data);
      });
  }

  /**
   * Take action based on user response within modal.
   *
   * @param {object} modalResponse
   * @returns {undefined}
   */
  projectActions(modalResponse) {
    if (modalResponse.publishConfirm === true) {
      this.internalPublishProject();
    } else if (modalResponse.deleteConfirm === true) {
      this.internalDeleteProject();
    }
  }

  /**
   * Save the current project data into state and navigate to the project edit view.
   *
   * @returns {undefined}
   */
  editProject() {
    this.storageService.state.project = this.project;
    this.storageService.state.back = { url: ['/p', this.project._id, 'project-details'], label: 'Edit Project' };
    this.router.navigate(['p', this.project._id, 'edit']);
  }

  /**
   * If a project has no submitted comments, show a modal to confirm deletion.
   *
   * @returns {undefined}
   */
  public deleteProject() {
    if (this.project['numComments'] > 0) {
      alert('A project with submitted comments cannot be deleted.');
      return;
    }

    this.ngxSmartModalService.setModalData({
      type: 'delete',
      title: 'Confirm Deletion',
      message: 'Do you really want to delete this project?'
    }, 'confirmation-modal', true);

    this.ngxSmartModalService.open('confirmation-modal');
  }

  /**
   * Delete the project by making a call to the API.
   *
   * @todo Either remove this if projects can't be deleted or make it work.
   * @returns {undefined}
   */
  private internalDeleteProject() {
    this.isDeleting = true;
    let observables = of(null);

    observables
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isDeleting = false;
          console.error('error =', error);
          alert('Uh-oh, couldn\'t delete project');
          // TODO: should fully reload project here so we have latest non-deleted objects
        },
        () => { // onCompleted
          this.isDeleting = false;
          // delete succeeded --> navigate back to search
          this.router.navigate(['/search']);
        }
      );
  }

  /**
   * Displays a modal to ask the user if they want to publish this project.
   *
   * @returns {undfined}
   */
  public publishProject() {
    this.ngxSmartModalService.setModalData({
        type: 'publish',
        title: 'Confirm Publish',
        message: 'Publishing this project will make it visible to the public. <br><br> Do you have Ministry Government Communications and Public Engagement (GCPE) approvals on all content? <br><br> Are you sure you want to proceed?'
      }, 'confirmation-modal', true);

    this.ngxSmartModalService.open('confirmation-modal');
  }

  /**
   * Ask the project service to publish the project.
   *
   * @returns {undefined}
   */
  private internalPublishProject() {
    this.isPublishing = true;

    this.projectService.publish(this.project)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isPublishing = false;
          console.error('error =', error);
          alert('Uh-oh, couldn\'t publish project');
          // TODO: should fully reload project here so we have latest isPublished flags for objects
        },
        () => { // onCompleted
          this.snackBarRef = this.snackBar.open('Project published...', null, { duration: 2000 });
          // reload all data
          this.projectService.getById(this.project._id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project => {
                this.isPublishing = false;
                this.project = project;
                this.visibility = 'Published';
              },
              error => {
                this.isPublishing = false;
                console.error('error =', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            );
        }
      );
  }

  /**
   * Asks the project service to un-publish the project.
   *
   * @returns {undefined}
   */
  public unPublishProject() {
    this.isUnpublishing = true;

    this.projectService.unPublish(this.project)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        () => { // onNext
          // do nothing here - see onCompleted() function below
        },
        error => {
          this.isPublishing = false;
          console.error('error =', error);
          alert('Uh-oh, couldn\'t publish project');
          // TODO: should fully reload project here so we have latest isPublished flags for objects
        },
        () => { // onCompleted
          this.snackBarRef = this.snackBar.open('Project un-published...', null, { duration: 2000 });
          // reload all data
          this.projectService.getById(this.project._id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              project => {
                this.isPublishing = false;
                this.project = project;
                this.visibility = 'Not Published';
              },
              error => {
                this.isPublishing = false;
                console.error('error =', error);
                alert('Uh-oh, couldn\'t reload project');
              }
            );
        }
      );
  }

  /**
   * Helper method to return the data type of the field value.
   *
   * @param {string|undefined} fieldValue
   * @returns {string}
   */
  projectFieldType(fieldValue) {
    return typeof fieldValue;
  }

  /**
   * Returns a string of the overlapping regional districts.
   *
   * @param {string|array} districts
   * @returns {string}
   */
  stringifyOverlappingDistricts(districts: string | string[]): string {
    let overlappingDistrictsListString: string;
    if (Array.isArray(districts) === true ) {
      overlappingDistrictsListString = (<string[]>districts).join(', ');
    } else {
      overlappingDistrictsListString = districts as string;
    }
    return overlappingDistrictsListString;
  }

  /**
   * Tear down component.
   *
   * @returns {undefined}
   */
  ngOnDestroy() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
