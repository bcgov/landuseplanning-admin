import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';
import { SurveyService } from 'app/services/survey.service';

import { Survey } from 'app/models/survey';

@Component({
  selector: 'app-project-survey-detail',
  templateUrl: './project-survey-detail.component.html',
  styleUrls: ['./project-survey-detail.component.scss']
})
export class ProjectSurveyDetailComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public commentPeriodPublishedStatus: string;
  public publishAction: string;
  public projectId: any;
  public currentProject: any;
  public surveyLastSaved: any;
  public loading;
  public survey: any;
  public commentPeriodDocs = [];
  public canDeleteCommentPeriod = false;
  public prettyCommentingMethod: string;
  public surveySelected: string | Survey;

  constructor(
    private storageService: StorageService,
    private surveyService: SurveyService,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,

    ) {}

  ngOnInit(): void {
    this.projectId = this.storageService.state.currentProject.data._id;

    this.route.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe(
      (data) => {
        this.survey = data.survey;
      })

      console.log('survey qs', this.survey.questions)

      this.currentProject = this.storageService.state.currentProject.data;
  }


  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  editSurvey() {
    console.log('that is the life', `/p/${this.projectId}/s/${this.survey._id}/edit`)
    this.router.navigateByUrl(`/p/${this.projectId}/s/${this.survey._id}/edit`);
  }

  deleteCommentPeriod() {
    if (confirm(`Are you sure you want to delete this survey?`)) {
      this.loading = true;
      this.surveyService.delete(this.survey)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t delete survey');
          },
          () => { // onCompleted
            // delete succeeded --> navigate back to search
            // Clear out the document state that was stored previously.
            this.loading = false;
            this.openSnackBar('This survey has been deleted', 'Close');
            this.router.navigate(['p', this.projectId, 'project-surveys']);
          }
        );
    }
  }

  // public addComment() {
  //   this.router.navigate(['/p', this.commentPeriod.project, 'cp', this.commentPeriod._id, 'add-comment']);
  // }

  // public exportSurveyResponses() {
  //   // Export all comments to CSV
  //   this.openSnackBar('Download Initiated', 'Close');
  //   this.api.exportComments(this.commentPeriod._id);
  // }

  // public downloadDocument(document) {
  //   return this.api.downloadDocument(document).then(() => {
  //     console.log('Download initiated for file');
  //   });
  // }

  public checkIfCanDelete() {
    this.canDeleteCommentPeriod = true;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
