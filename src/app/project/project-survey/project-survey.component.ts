import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { ProjectSurveyTableRowsComponent } from 'app/project/project-survey/project-survey-table-rows/project-survey-table-rows.component';

import { SurveyService } from 'app/services/survey.service';
import { Survey } from 'app/models/survey';

import { StorageService } from 'app/services/storage.service';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-project-survey',
  templateUrl: './project-survey.component.html',
  styleUrls: ['./project-survey.component.css']
})
export class ProjectSurveyComponent implements OnInit, OnDestroy {

  public loading = false;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public surveys: Survey[] = null;
  public surveyTableColumns: any[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-6'
    },
    {
      name: 'Date Added',
      value: 'dateAdded',
      width: 'col-3'
    },
    {
      name: 'Last Saved',
      value: 'lastSaved',
      width: 'col-3'
    }
  ];
  public surveyTableData: TableObject;
  // public loading = true;
  public currentProject;

  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private surveyService: SurveyService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;
    this.storageService.state.currentCommentPeriod = null;

    this.currentProject = this.storageService.state.currentProject.data;

    this.route.params.subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
      if (this.tableParams.sortBy === '') {
        this.tableParams.sortBy = '+name';
      }
    });
    this.storageService.state.selectedTab = 0;

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (res: any) => {
          if (res) {
            this.tableParams.totalListItems = res.surveys.totalCount;
            if (this.tableParams.totalListItems > 0) {
              this.surveys = res.surveys.data;
            } else {
              this.tableParams.totalListItems = 0;
              this.surveys = [];
            }
            this.setSurveyRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load surveys');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedSurveys(this.tableParams.currentPage);
  }

  setSurveyRowData() {
    let surveyList = [];
    this.surveys.forEach(survey => {

      surveyList.push(
        {
          _id: survey._id,
          name: survey.name,
          lastSaved: survey.lastSaved,
          dateAdded: survey.dateAdded,
          project: survey.project,
          // _id: commentPeriod._id,
          // project: commentPeriod.project
        }
      );
    });
    this.surveyTableData = new TableObject(
      ProjectSurveyTableRowsComponent,
      surveyList,
      this.tableParams
    );
  }

  public getPaginatedSurveys(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    // this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.surveyService.getAllByProjectId(this.currentProject._id, pageNumber, this.tableParams.pageSize, this.tableParams.sortBy)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.surveys = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setSurveyRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  public addSurvey() {
    this.storageService.state.currentProject = this.currentProject;
    this.router.navigate(['p', this.currentProject._id, 'project-surveys', 'add']);
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
