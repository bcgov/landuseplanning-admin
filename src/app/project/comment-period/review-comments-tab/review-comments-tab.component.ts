import { Component, ChangeDetectorRef, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { ActivatedRoute, Router } from '@angular/router';

import { ReviewCommentsTabTableRowsComponent } from './review-comments-tab-table-rows/review-comments-tab-table-rows.component';

import { CommentService } from 'app/services/comment.service';
import { StorageService } from 'app/services/storage.service';

import { Comment } from 'app/models/comment';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-review-comments-tab',
  templateUrl: './review-comments-tab.component.html',
  styleUrls: ['./review-comments-tab.component.scss']
})

export class ReviewCommentsTabComponent implements OnInit, OnDestroy {

  @Output() commentsLoaded = new EventEmitter();

  public comments: Array<Comment>;
  public loading = true;

  public filter = {
    'pending': false,
    'published': false,
    'deferred': false,
    'rejected': false
  };

  public commentTableData: TableObject;
  public commentTableColumns: any[] = [
    {
      name: 'ID',
      value: 'commentId',
      width: 'col-1'
    },
    {
      name: 'Name',
      value: 'author',
      width: 'col-2'
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: 'col-3'
    },
    {
      name: 'Attachments',
      value: 'null',
      width: 'col-2',
      nosort: true
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
    private _changeDetectionRef: ChangeDetectorRef,
    private commentService: CommentService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  /**
   * If the comment review params are empty, get the comment data from the route
   * resolver and update the various filters that track the state of the review.
   * Update the table params.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    if (this.storageService.state.commentReviewTabParams == null) {
      this.route.params.subscribe(params => {
        this.commentPeriodId = params.commentPeriodId;
        this.filter.pending = params.pending == null || params.pending === 'false' ? false : true;
        this.filter.published = params.published == null || params.published === 'false' ? false : true;
        this.filter.deferred = params.deferred == null || params.deferred === 'false' ? false : true;
        this.filter.rejected = params.rejected == null || params.rejected === 'false' ? false : true;
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, this.filter);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '-commentId';
        }
      });
    } else {
      this.commentPeriodId = this.storageService.state.commentReviewTabParams.commentPeriodId;
      this.filter = this.storageService.state.commentReviewTabParams.filter;
      this.tableParams = this.storageService.state.commentReviewTabParams.tableParams;
      this.storageService.state.commentReviewTabParams = null;
    }
    this.storageService.state.selectedTab = 0;

    this.commentService.getByPeriodId(
      this.commentPeriodId,
      this.tableParams.currentPage,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      true,
      this.filter)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.tableParams.totalListItems = res.totalCount;
          this.commentsLoaded.emit(res.totalCount);
          if (this.tableParams.totalListItems > 0) {
            this.comments = res.data;
            this.setCommentRowData();

            // If there is a published comment, we are not allowed to delete the comment period.
            let canDelete = true;
            for (let comment of this.comments) {
              if (comment.eaoStatus === 'Published') {
                canDelete = false;
                break;
              }
            }
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
   * Toggle the pending filter and get the paginated comments.
   * 
   * @return {void}
   */
  public togglePending() {
    this.filter.pending = !this.filter.pending;
    this.getPaginatedComments(1);
  }

  /**
   * Toggle the published filter and get the paginated comments.
   * 
   * @return {void}
   */
  public togglePublished() {
    this.filter.published = !this.filter.published;
    this.getPaginatedComments(1);
  }

  /**
   * Toggle the deffered filter and get the paginated comments.
   * 
   * @return {void}
   */
  public toggleDeferred() {
    this.filter.deferred = !this.filter.deferred;
    this.getPaginatedComments(1);
  }

  /**
   * Toggle the rejected filter and get the paginated comments.
   * 
   * @return {void}
   */
  public toggleRejected() {
    this.filter.rejected = !this.filter.rejected;
    this.getPaginatedComments(1);
  }

  /**
   * Update the comment list with all the comment data, then add that update
   * the table with the comments.
   * 
   * @return {void}
   */
  setCommentRowData(): void {
    let commentList = [];
    this.comments.forEach(comment => {
      commentList.push(
        {
          _id: comment._id,
          // Safety check if documents are null or are present with an emtpy array
          attachments: comment.documents !== null ? comment.documents.length : 0,
          commentId: comment.commentId,
          author: comment.author,
          comment: comment.comment,
          dateAdded: comment.dateAdded,
          eaoStatus: comment.eaoStatus,
          location: comment.location,
          period: comment.period,
        }
      );
    });
    this.commentTableData = new TableObject(
      ReviewCommentsTabTableRowsComponent,
      commentList,
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
   * Scroll to the top of the window, then get the table params to make
   * a call to the API with. Returns a specific comment period. Update the URL
   * with the user's selected table data.
   * 
   * @param {number} pageNumber The page number used in getting updated table params.
   * @return {void}
   */
  getPaginatedComments(pageNumber): void {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.commentService.getByPeriodId(this.commentPeriodId, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortBy, true, this.filter)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.comments = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.filter);
        this.setCommentRowData();

        this.storageService.state.commentReviewTabParams = { tableParams: this.tableParams, filter: this.filter, commentPeriodId: this.commentPeriodId };
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
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
