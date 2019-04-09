import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { CommentPeriod } from 'app/models/commentPeriod';
import { TableObject } from 'app/shared/components/table-template/table-object';

import { CommentPeriodsTableRowsComponent } from 'app/project/comment-periods/comment-periods-table-rows/comment-periods-table-rows.component';

import { CommentPeriodService } from 'app/services/commentperiod.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';

@Component({
  selector: 'app-comment-periods',
  templateUrl: './comment-periods.component.html',
  styleUrls: ['./comment-periods.component.scss']
})
export class CommentPeriodsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public projectId: string;
  public commentPeriods: CommentPeriod[] = null;
  public commentPeriodTableColumns: any[] = [
    {
      name: 'Status',
      value: 'commentPeriodStatus',
      width: 'col-1'
    },
    {
      name: 'Start Date',
      value: 'dateStarted',
      width: 'col-2'
    },
    {
      name: 'End Date',
      value: 'dateCompleted',
      width: 'col-2'
    },
    {
      name: 'Days Remaining',
      value: 'daysRemaining',
      width: 'col-2'
    },
    {
      name: 'Published',
      value: 'isPublished',
      width: 'col-1'
    },
    {
      name: 'Comment Data',
      value: 'commentData',
      width: 'col-4'
    }
  ];
  public commentPeriodTableData: TableObject;
  public loading = true;

  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private commentPeriodService: CommentPeriodService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.projectId = params.projId;
    });

    this.route.params.subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
    });

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (res: any) => {
          if (res) {
            this.tableParams.totalListItems = res.commentPeriods.totalCount;
            if (this.tableParams.totalListItems > 0) {
              this.commentPeriods = res.commentPeriods.data;
              this.setCPRowData();
            }
          } else {
            alert('Uh-oh, couldn\'t load comment periods');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        }
      );
  }

  setColumnSort(column) {
    this.tableParams.sortBy = column;
    this.tableParams.sortDirection = this.tableParams.sortDirection > 0 ? -1 : 1;
    this.getPaginatedComments(this.tableParams.currentPage, this.tableParams.sortBy, this.tableParams.sortDirection);
  }

  setCPRowData() {
    let cpList = [];
    this.commentPeriods.forEach(commentPeriod => {
      // Determine if the CP is published by checking in read is Public
      let isPublished = 'Not Published';
      commentPeriod.read.forEach(element => {
        if (element === 'public') {
          isPublished = 'Published';
        }
      });

      cpList.push(
        {
          commentPeriodStatus: commentPeriod.commentPeriodStatus,
          dateStarted: commentPeriod.dateStarted,
          dateCompleted: commentPeriod.dateCompleted,
          daysRemaining: commentPeriod.daysRemaining,
          read: isPublished,
          // TODO: Figure out pending, deferred, published, rejected
          // commmentData:
          _id: commentPeriod._id,
          project: commentPeriod.project
        }
      );
    });
    this.commentPeriodTableData = new TableObject(
      CommentPeriodsTableRowsComponent,
      cpList,
      this.tableParams
    );
  }

  public getPaginatedComments(pageNumber, newSortBy, newSortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, newSortBy, newSortDirection);

    this.commentPeriodService.getAllByProjectId(this.projectId, pageNumber, this.tableParams.pageSize, this.tableParams.sortString)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.commentPeriods = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortString, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setCPRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  public addCommentPeriod() {
    this.router.navigate(['p', this.projectId, 'comment-periods', 'add']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
