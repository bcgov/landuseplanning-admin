import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { DialogService } from 'ng2-bootstrap-modal';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { Comment } from '../../models/comment';
import { CommentService } from '../../services/comment.service';
import { ApiService } from '../../services/api';
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

  readonly orders = ['Ordinal', 'Name', 'Date', 'Status'];

  public loading: boolean;
  public appId: string;
  public application: Application; // used for display app info
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
    private commentService: CommentService,
    private api: ApiService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.loading = true;
    this.appId = null;
    this.comments = [];
    this.alerts = [];
    this.currentComment = null;

    this.route.params.subscribe(
      (params: Params) => { this.appId = params.application || '0'; }
    );

    // get application
    // this is independent of comment periods data
    this.applicationService.getById(this.appId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
      application => {
        this.application = application;
      },
      error => {
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        this.alerts.push('Error loading application');
        // console.log(error); // already displayed by handleError()
      });

    // get comments
    // this is independent of application data
    this.commentService.getByApplicationId(this.appId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
      comments => {
        this.loading = false;
        this.comments = comments;
        this.sort(this.orders[0]); // initial order

        // pre-select first comment
        if (this.comments.length > 0) {
          this.currentComment = this.comments[0];
        }
      },
      error => {
        this.loading = false;
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        this.alerts.push('Error loading comments');
        // console.log(error); // already displayed by handleError()
      });
  }

  sort(order: string) {
    return this.comments.sort(function (a: Comment, b: Comment) {
      switch (order) {
        case 'Ordinal': return (a.commentNumber > b.commentNumber) ? 1 : -1;
        case 'Name': return (a.commentAuthor.contactName > b.commentAuthor.contactName) ? 1 : -1;
        case 'Date': return (a.dateAdded > b.dateAdded) ? 1 : -1;
        case 'Status': return (a.commentStatus > b.commentStatus) ? 1 : -1;
        default: return 0;
      }
    });
  }

  addClick() {
    this.dialogService.addDialog(AddCommentComponent,
      {
        title: 'Add Comment',
        message: 'Save'
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
          // TODO: reload page (if not observable binding)?
          console.log('saved');
        } else {
          console.log('canceled');
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getStatus(item: Comment) {
    switch (item.commentStatus) {
      case this.accepted: return 'badge-success';
      case this.pending: return 'badge-secondary';
      case this.rejected: return 'badge-danger';
      default: return 'badge-light'; // error
    }
  }
}
