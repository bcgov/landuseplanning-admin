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

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.storageService.state.selectedTab = 1;


    this.route.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe(
      (data) => {
        this.surveyResponse = data.surveyResponse;
        this.commentPeriod = data.cpAndSurveys.commentPeriod;
      })

      this.surveyQuestions = this.surveyResponse.responses.map(response => response.question)
      this.surveyItemCount(this.surveyQuestions)
  }


  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  public editSurvey() {
    this.router.navigateByUrl(`/p/${this.projectId}/s/${this.survey._id}/edit`);
  }

  public deleteCommentPeriod() {
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

  public downloadDocument(document: any) {
    return this.api.downloadDocument(document).then(() => {
      console.log('Download initiated for file(s)');
    });
  }

  //
  // Displays the question number beside each question
  //
  public surveyItemCount(questions) {
    // Does not display number next to info boxes
    let infoCount = 0;
    for (let i = 0; i < questions.length; i++) {
      // Increment count by three to account for array index of 0
      // and the author and location fields present on each survey
      let count = i + 3;
      if (questions[i].type === 'info') {
        this.countArray.push('')
        infoCount++;
      } else {
        this.countArray.push(count - infoCount)
      }
    }
  }

  public checkIfCanDelete() {
    this.canDeleteCommentPeriod = true;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
