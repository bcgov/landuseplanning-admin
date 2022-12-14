import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

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
  public surveyCopy: any;
  public countArray = [];
  public commentPeriodDocs = [];
  public canDeleteSurvey = false;
  public prettyCommentingMethod: string;
  public surveySelected: string | Survey;

  constructor(
    private storageService: StorageService,
    private surveyService: SurveyService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    ) {}

  /**
   * Load the survey data from the route resolver, store the number of questions
   * set the current project by retrieving the relevant data from local storage.
   * 
   * @return {void}
   */
  ngOnInit(): void {
      this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: any) => {
        if (data.survey) {
          this.survey = data.survey;
          this.surveyItemCount(this.survey.questions)
          this.currentProject = this.storageService.state.currentProject.data;
          this.projectId = this.storageService.state.currentProject.data._id;
          this.loading = false;
        } else {
          alert('Uh-oh, couldn\'t survey. It may no longer exist.');
          // survey not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  /**
   * Opens a new snack bar notification message with a duration of 2 seconds, and executes an action
   *
   * @param {string} message A snack bar notification message.
   * @param {string} action A snack bar notification action.
   * @returns {void}
   */
   public openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  /**
   * Navigate the user to the survey edit screen.
   * 
   * @return {void}
   */
  editSurvey(): void {
    this.router.navigateByUrl(`/p/${this.projectId}/s/${this.survey._id}/edit`);
  }

  /**
   * Handle the deletion of a survey. First, prompt the user to confirm,
   * then make a call to the API to delete the survey in the database. Give
   * feedback when the action is complete whether or not it succeeded or failed.
   * 
   * @return {void}
   */
  deleteSurvey(): void {
    if (confirm(`Are you sure you want to delete this survey?`)) {
      this.loading = true;
      this.surveyService.delete(this.survey)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.error(error);
            alert('Uh-oh, couldn\'t delete survey');
          },
          () => { // onCompleted
            // delete succeeded --> navigate back to search
            // Clear out the document state that was stored previously.
            this.loading = false;
            this.openSnackBar('This survey has been deleted', 'Close');
            this.router.navigate(['/p', this.projectId, 'project-surveys']);
          }
        );
    }
  }

  /**
   * Displays the question number beside each question.
   * 
   * @param {Array} questions The questions to display a number beside.
   * @return {void}
   */
  surveyItemCount(questions): void {
    // Does not display number next to info boxes
    let infoCount = 0;
    for (let i = 0; i < questions.length; i++) {
      // Removing the author and location field so
      // only incrementing by 1
      let count = i + 1;
      if (questions[i].type === 'info') {
        this.countArray.push('')
        infoCount++;
      } else {
        this.countArray.push(count - infoCount)
      }
    }
  }

  /**
   * Set the survey as able to be deleted.
   * 
   * @return {void}
   */
   public checkIfCanDelete(): void {
    this.canDeleteSurvey = true;
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
