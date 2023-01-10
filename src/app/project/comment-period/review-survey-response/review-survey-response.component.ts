import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { CdkDragDrop, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SurveyBuilderService } from 'app/services/surveyBuilder.service';
import { SurveyQuestion }    from 'app/models/surveyQuestion';
import { Survey }    from 'app/models/survey';
import { Project }    from 'app/models/project';

import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';
import { SurveyService } from 'app/services/survey.service';
import { ApiService } from 'app/services/api';
import { first } from 'rxjs/operators';
import { SurveyResponse } from 'app/models/surveyResponse';
import { CommentPeriod } from 'app/models/commentPeriod';

@Component({
  selector: 'app-review-survey-response',
  templateUrl: './review-survey-response.component.html',
  styleUrls: ['./review-survey-response.component.scss']
})
export class ReviewSurveyResponseComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public commentPeriodPublishedStatus: string;
  public publishAction: string;
  public projectId: any;
  public currentProject: Project;
  public surveyLastSaved: any;
  public loading;
  public survey: any;
  public surveyResponse: SurveyResponse;
  public surveyQuestions: any;
  public commentPeriod: CommentPeriod;
  public countArray = [];
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

  /**
   * Get the current project from local storage. Get the survey response and
   * comment period from the route resolver. Update the survey questions property
   * and the number of survey questions.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    this.currentProject = this.storageService.state.currentProject.data;
    this.storageService.state.selectedTab = 1;

    this.route.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe((data) => {
        this.surveyResponse = data.surveyResponse;
        this.commentPeriod = data.cpAndSurveys.commentPeriod;
    })

    this.surveyQuestions = this.surveyResponse.responses.map(response => response.question)
    this.surveyItemCount(this.surveyQuestions)
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
   * Navigate the user to the survey edit page.
   * 
   * @return {void}
   */
  public editSurvey(): void {
    this.router.navigateByUrl(`/p/${this.projectId}/s/${this.survey._id}/edit`);
  }

  /**
   * Send a call to the API to download a given document/file. Return the
   * async response.
   * 
   * @param {Document} document The document(file) to download.
   * @returns {Promise<void>}
   */
   public downloadDocument(document) {
    return this.api.downloadDocument(document);
  }

  /**
   * Builds a numbered list to keep track of the questions in the survey builder.
   * 
   * @param {Array} questions The survey questions to build a list for.
   * @return {void}
   */
  public surveyItemCount(questions) {
    // Does not display number next to info boxes
    let infoCount = 0;
    for (let i = 0; i < questions.length; i++) {
      //
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
   * Set the comment period as able to be deleted.
   * 
   * @return {void}
   */
   public checkIfCanDelete(): void {
    this.canDeleteCommentPeriod = true;
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
