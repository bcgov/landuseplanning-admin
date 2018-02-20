import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
// import 'rxjs/add/operator/toPromise';
// import 'rxjs/add/operator/first';
import { DialogService } from 'ng2-bootstrap-modal';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';
import { ApiService } from 'app/services/api';

import { CommentDetailComponent } from './comment-detail/comment-detail.component';
import { AddCommentComponent } from './add-comment/add-comment.component';

@Component({
  selector: 'app-review-comments',
  templateUrl: './review-comments.component.html',
  styleUrls: ['./review-comments.component.scss'],
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class ReviewCommentsComponent implements OnInit, OnDestroy {
  readonly accepted = 'Accepted';
  readonly pending = 'Pending';
  readonly rejected = 'Rejected';

  readonly sortKeys = ['Ordinal', 'Name', 'Date', 'Status'];

  public loading = true;
  public appId: string;
  public application: Application;
  public periodId: string;
  public comments: Array<Comment>;
  public alerts: Array<string>;
  public currentComment: Comment;

  // see official solution:
  // https://stackoverflow.com/questions/38008334/angular-rxjs-when-should-i-unsubscribe-from-subscription
  // or http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
    private commentService: CommentService,
    private api: ApiService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.comments = [];
    this.alerts = [];

    // get route parameters
    this.appId = this.route.snapshot.queryParamMap.get('application');

    // get application
    // this is independent of comment data
    // TODO: get from route? (see public tabs)
    this.applicationService.getById(this.appId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        application => {
          this.application = application;
        },
        error => {
          if (error.startsWith('403')) { this.router.navigate(['/login']); }
          this.alerts.push('Error loading application');
        });

    // TODO: get current comment period
    // get comment periods
    // this is independent of application data
    this.commentPeriodService.getAllByApplicationId(this.appId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        periods => {
          if (periods.length > 0) {
            // for now, pick first comment period
            this.periodId = periods[0]._id;
          }
        },
        error => {
          if (error.startsWith('403')) { this.router.navigate(['/login']); }
          this.alerts.push('Error loading comment periods');
        });

    // get comments
    // this is independent of application data

    // this.commentService.getAllByApplicationId(this.appId)
    //   .first()
    //   .subscribe(
    //     comments => {
    //       this.loading = false;
    //       this.comments = comments;
    //       console.log('comments = ', comments);
    //       console.log('#comments = ', comments.length);
    //     },
    //     error => {
    //       this.loading = false;
    //       console.log('err =', error);
    //     });

    // this.commentService.getAllByApplicationId(this.appId)
    //   .map(comments => {
    //     this.loading = false;
    //     this.comments = comments;
    //     console.log('comments = ', comments);
    //     console.log('#comments = ', comments.length);
    //   })
    //   .toPromise()
    //   .catch(err => console.log('err =', err));

    this.commentService.getAllByApplicationId(this.appId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
      comments => {
        this.loading = false;
        this.comments = comments;
        console.log ('comments = ', comments);
        console.log ('#comments = ', comments.length);
        this.sort(this.sortKeys[0]); // initial order

        // pre-select first comment
        // TODO: doesn't work because we don't have comments yet -- need promise instead?
        if (this.comments.length > 0) {
          console.log('pre-selecting comment =', comments[0]);
          this.setCurrentComment(this.comments[0]);
        }
      },
      error => {
        this.loading = false;
        if (error.startsWith('403')) { this.router.navigate(['/login']); }
        this.alerts.push('Error loading comments');
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private sort(key: string): Comment[] {
    return this.comments.sort(function (a: Comment, b: Comment) {
      switch (key) {
        case 'Ordinal': return (a.commentNumber > b.commentNumber) ? 1 : -1;
        case 'Name': return (a.commentAuthor.contactName > b.commentAuthor.contactName) ? 1 : -1;
        case 'Date': return (a.dateAdded > b.dateAdded) ? 1 : -1;
        case 'Status': return (a.commentStatus > b.commentStatus) ? 1 : -1;
        default: return 0;
      }
    });
  }

  public addClick() {
    if (this.periodId) {
      this.dialogService.addDialog(AddCommentComponent,
        {
          periodId: this.periodId
        }, {
          // index: 0,
          // autoCloseTimeout: 10000,
          // closeByClickingOutside: true,
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe)
        .subscribe((isConfirmed) => {
          // we get dialog result
          if (isConfirmed) {
            // TODO: reload page?
            console.log('saved');
          } else {
            console.log('canceled');
          }
        });
    }
  }

  private setCurrentComment(item) {
    const index = _.findIndex(this.comments, { _id: item._id });
    if (index >= 0) {
      this.comments.splice(index, 1, item);
      this.currentComment = item;
    }
  }

  private isCurrentComment(item): boolean {
    // return _.isMatch(this.currentComment, item);
    return (item === this.currentComment);
  }

  private getBadgeClass(item: Comment): string {
    switch (item.commentStatus) {
      case this.accepted: return 'badge-success';
      case this.pending: return 'badge-secondary';
      case this.rejected: return 'badge-danger';
      default: return 'badge-light'; // error
    }
  }
}
