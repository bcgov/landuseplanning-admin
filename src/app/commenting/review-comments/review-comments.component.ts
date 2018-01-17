import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
// import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { CommentPeriod } from '../../models/commentperiod';
import { CommentPeriodService } from '../../services/commentperiod.service';
import { Comment } from '../../models/comment';
import { CommentService } from '../../services/comment.service';

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

  // private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
    private commentService: CommentService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.appId = '0';
    this.commentPeriods = [];
    this.periodId = '0';
    this.comments = [];

    this.route.params.subscribe((params: Params) => {
      this.appId = params.application || '0';
    });

    // get application
    this.applicationService.getById(this.appId).subscribe(
      data => {
        this.application = data;
      },
      error => {
        console.log(error);
      }
    );

    // get comment periods
    this.commentPeriodService.getAll(this.appId).subscribe(
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
        alert('Error loading comment periods');
        // console.log(error); // already displayed by handleError()
      },
      () => {
        // this.loading = false;
      }
    );

    // get comments
    // TODO: for now, just get comments for first comment period
    // FUTURE: pass array of comment period ids
    this.commentService.getAll(this.periodId).subscribe(
      data => {
        this.comments = data;
      },
      error => {
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        alert('Error loading comments');
        // console.log(error); // already displayed by handleError()
      },
      () => {
        this.loading = false;
      }
    );
  }

  ngOnDestroy(): void {
    // this.sub.unsubscribe();
  }

}
