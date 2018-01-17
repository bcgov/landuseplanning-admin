import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { CommentPeriod } from '../../models/commentperiod';
import { CommentPeriodService } from '../../services/commentperiod.service';
import { Comment } from '../../models/comment';
import { CommentService } from '../../services/comment.service';
import { ApiService } from '../../services/api';

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
  public application: Application;
  public commentPeriods: Array<CommentPeriod>;
  public periodId: string;
  public comments: Array<Comment>;
  public alerts: Array<string>;

  // another way to help unsubscribe from observables:
  // https://www.npmjs.com/package/ng2-rx-componentdestroyed
  private subParams: Subscription;
  private subAppl: Subscription;
  private subPeriod: Subscription;
  private subComment: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
    private commentService: CommentService,
    private api: ApiService
  ) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.loading = true;
    this.appId = '0';
    this.commentPeriods = [];
    this.periodId = '0';
    this.comments = [];
    this.alerts = [];

    this.subParams = this.route.params.subscribe(
      (params: Params) => { this.appId = params.application || '0'; }
    );

    // get application
    this.subAppl = this.applicationService.getById(this.appId)
      .subscribe(
      data => {
        this.application = data;
      },
      error => {
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        this.alerts.push('Error loading application');
        // console.log(error); // already displayed by handleError()
      });

    // get comment periods
    this.subPeriod = this.commentPeriodService.getAll(this.appId)
      .subscribe(
      data => {
        this.commentPeriods = data;
        // TODO: for now, just save first comment period id
        // FUTURE: create array of comment period ids
        this.periodId = data.length > 0 ? data[0]._id : '0';
      },
      error => {
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        this.alerts.push('Error loading comment periods');
        // console.log(error); // already displayed by handleError()
      });

    // get comments
    // TODO: for now, just get comments for first comment period
    // FUTURE: pass array of comment period ids
    this.subComment = this.commentService.getAll(this.periodId)
      // .finally(() => this.loading = false) // TODO: make this work
      .subscribe(
      data => {
        this.loading = false; // TODO: only called on successful completion :()
        this.comments = data;
      },
      error => {
        this.loading = false; // TODO: only called on successful completion :()
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        this.alerts.push('Error loading comments');
        // console.log(error); // already displayed by handleError()
      });
  }

  ngOnDestroy(): void {
    this.subParams.unsubscribe();
    this.subAppl.unsubscribe();
    this.subPeriod.unsubscribe();
    this.subComment.unsubscribe();
  }

}
