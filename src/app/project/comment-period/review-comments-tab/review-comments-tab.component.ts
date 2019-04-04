import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { ActivatedRoute, Router } from '@angular/router';

import { ReviewCommentsTabTableRowsComponent } from './review-comments-tab-table-rows/review-comments-tab-table-rows.component';

import { CommentService } from 'app/services/comment.service';

import { Comment } from 'app/models/comment';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-review-comments-tab',
  templateUrl: './review-comments-tab.component.html',
  styleUrls: ['./review-comments-tab.component.scss']
})

export class ReviewCommentsTabComponent implements OnInit, OnDestroy {
  public comments: Array<Comment>;
  public loading = true;

  public commentTableData: TableObject;
  public commentTableColumns: any[] = [
    {
      name: 'Name',
      value: 'author',
      width: 'col-3'
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: 'col-3'
    },
    {
      name: 'Attachments',
      value: 'null',
      width: 'col-1'
    },
    {
      name: 'Response',
      value: 'null',
      width: 'col-1'
    },
    {
      name: 'Location',
      value: 'location',
      width: 'col-2'
    },
    {
      name: 'Status',
      value: 'eaoStatus',
      width: 'col-2'
    }
  ];

  public tableParams: TableParamsObject = new TableParamsObject();
  public commentPeriodId: string;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private router: Router,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.commentPeriodId = params.commentPeriodId;
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
    });

    this.commentService.getByPeriodId(this.commentPeriodId, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortString, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.tableParams.totalListItems = res.totalCount;
          if (this.tableParams.totalListItems > 0) {
            this.comments = res.data;
            this.setCommentRowData();
          }
        } else {
          alert('Uh-oh, couldn\'t load comments');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  setCommentRowData() {
    let commentList = [];
    this.comments.forEach(comment => {
      commentList.push(
        {
          author: comment.author,
          dateAdded: comment.dateAdded,
          attachments: null,
          response: null,
          location: comment.location,
          eaoStatus: comment.eaoStatus,
          comment: comment.comment
        }
      );
    });
    this.commentTableData = new TableObject(
      ReviewCommentsTabTableRowsComponent,
      commentList,
      this.tableParams
    );
  }

  setColumnSort(column) {
    this.tableParams.sortBy = column;
    this.tableParams.sortDirection = this.tableParams.sortDirection > 0 ? -1 : 1;
    this.getPaginatedComments(this.tableParams.currentPage, this.tableParams.sortBy, this.tableParams.sortDirection);
  }

  getPaginatedComments(pageNumber, newSortBy, newSortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, newSortBy, newSortDirection);

    this.commentService.getByPeriodId(this.commentPeriodId, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortString, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.comments = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortString, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setCommentRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
