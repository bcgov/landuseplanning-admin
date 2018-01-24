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
  public loading: boolean;
  public appId: string;
  public application: Application; // used for display app info
  public comments: Array<Comment>;
  public alerts: Array<string>;

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
    this.appId = '0';
    this.comments = [];
    this.alerts = [];

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
    if (item.commentStatus === 'Accepted') {
      return 'badge-success';
    } else if (item.commentStatus === 'Rejected') {
      return 'badge-danger';
    } else if (item.commentStatus === 'Pending') {
      return 'badge-secondary';
    } else {
      return 'badge-light';
    }
  }

}
