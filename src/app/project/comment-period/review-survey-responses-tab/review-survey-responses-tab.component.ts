import { Component, ChangeDetectorRef, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { catchError, switchMap, tap } from 'rxjs/operators';


import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { ActivatedRoute, Router } from '@angular/router';

import { ReviewSurveyResponsesTabTableRowsComponent } from './review-survey-responses-tab-table-rows/review-survey-responses-tab-table-rows.component';

import { SurveyService } from 'app/services/survey.service';
import { SurveyResponseService } from 'app/services/surveyResponse.service';
import { StorageService } from 'app/services/storage.service';

import { Survey } from 'app/models/survey';
import { SurveyResponse } from 'app/models/surveyResponse';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-review-survey-responses-tab',
  templateUrl: './review-survey-responses-tab.component.html',
  styleUrls: ['./review-survey-responses-tab.component.css']
})
export class ReviewSurveyResponsesTabComponent implements OnInit {

  @Input() public surveys: Array<Survey>;
  @Output() responsesLoaded = new EventEmitter();

  public surveyNames = {};
  public surveyResponses: Array<SurveyResponse>;
  public loading = true;
  public tableParams: TableParamsObject = new TableParamsObject();
  public commentPeriodId: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();


  public filter = {
    'pending': false,
    'published': false,
    'deferred': false,
    'rejected': false
  };

  public surveyResponseTableData: TableObject;
  public surveyResponseTableColumns: any[] = [
    {
      name: 'ID',
      value: 'commentId',
      width: 'col-1'
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: 'col-3'
    },
    {
      name: 'Survey',
      value: 'survey',
      width: 'col-3'
    },
    {
      name: 'Attachments',
      value: 'null',
      width: 'col-1',
      nosort: true
    },
  ];

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private surveyService: SurveyService,
    private surveyResponseService: SurveyResponseService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  /**
   * If there are no comment review params in local storage, get the comment
   * period ID from the route resolver, reset the table sorting, then set the
   * list of surveys. Else, set the comment review params from local storage.
   * 
   * Also queries the API for the attached survey response.
   * 
   * @return {void}
   */
  ngOnInit() {
    if (this.storageService.state.commentReviewTabParams == null) {
      this.route.params.subscribe(params => {
        this.commentPeriodId = params.commentPeriodId;
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, this.filter);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '-commentId';
        }
      });

      if (this.surveys) {
        this.surveys.forEach(survey => this.surveyNames[survey._id] = survey.name)
      }

    } else {
      this.commentPeriodId = this.storageService.state.commentReviewTabParams.commentPeriodId;
      this.filter = this.storageService.state.commentReviewTabParams.filter;
      this.tableParams = this.storageService.state.commentReviewTabParams.tableParams;
      this.storageService.state.commentReviewTabParams = null;
    }
    this.storageService.state.selectedTab = 0;

    this.surveyResponseService.getByPeriodId(
      this.commentPeriodId,
      this.tableParams.currentPage,
      0,
      this.tableParams.sortBy,
      true)
      .subscribe((res: any) => {
        if (res) {
          this.responsesLoaded.emit(res);
        }
      })

    this.surveyResponseService.getByPeriodId(
      this.commentPeriodId,
      this.tableParams.currentPage,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.tableParams.totalListItems = res.totalCount;
          if (this.tableParams.totalListItems > 0) {
            this.surveyResponses = res.data;
            this.setCommentRowData();

            // If there is a published survey response, we are not allowed to delete the comment period.
            let canDelete = true;

            this.storageService.state.canDeleteCommentPeriod = { type: 'canDeleteCommentPeriod', data: canDelete };
          } else {
            this.storageService.state.canDeleteCommentPeriod = { type: 'canDeleteCommentPeriod', data: true };
          }
          this.storageService.state.commentReviewTabParams = { tableParams: this.tableParams, filter: this.filter, commentPeriodId: this.commentPeriodId };
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load comments');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  /**
   * Set up the survey response data for use display in the table(by building
   * a new TableObject with the data).
   * 
   * @return {void}
   */
  setCommentRowData() {
    let surveyResponseList = [];
    this.surveyResponses.forEach(sr => {
      surveyResponseList.push(
        {
          _id: sr._id,
          // Safety check if documents are null or are present with an emtpy array
          attachments: sr.documents !== null ? sr.documents.length : 0,
          commentId: sr.commentId,
          author: sr.author,
          responses: sr.responses,
          dateAdded: sr.dateAdded,
          location: sr.location,
          period: sr.period,
          survey: this.surveyNames[sr.survey],
        }
      );
    });
    this.surveyResponseTableData = new TableObject(
      ReviewSurveyResponsesTabTableRowsComponent,
      surveyResponseList,
      this.tableParams
    );
  }

  /**
   * When the user sorts the table by column, update the table params
   * with the sort type and direction(+,-), then get a list of comments
   * sorted accordingly.
   * 
   * @param {string} column What value to sort by.
   * @return {void}
   */
  setColumnSort(column): void {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedComments(this.tableParams.currentPage);
  }

  /**
   * Section the survey responses into "pages" for display in the table.
   * 
   * @param {number} pageNumber The page number to update the table with.
   * @return {void}
   */
  getPaginatedComments(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.surveyResponseService.getByPeriodId(this.commentPeriodId, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortBy, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.surveyResponses = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.filter);
        this.setCommentRowData();

        this.storageService.state.commentReviewTabParams = { tableParams: this.tableParams, filter: this.filter, commentPeriodId: this.commentPeriodId };
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });

    this.surveyResponseService.getAllByProjectId
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
