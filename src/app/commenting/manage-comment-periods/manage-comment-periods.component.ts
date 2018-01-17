import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
// import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { CommentPeriod } from '../../models/commentperiod';
import { CommentPeriodService } from '../../services/commentperiod.service';

@Component({
  selector: 'app-manage-comment-periods',
  templateUrl: './manage-comment-periods.component.html',
  styleUrls: ['./manage-comment-periods.component.scss'],
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

export class ManageCommentPeriodsComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public appId: string;
  public application: Application;
  public commentPeriods: Array<CommentPeriod>;

  // private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.appId = '0';
    this.commentPeriods = [];

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
        // FUTURE: display buttons (or enable them) conditionally based on status
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
        this.loading = false;
      }
    );
  }

  ngOnDestroy(): void {
    // this.sub.unsubscribe();
  }

  private getStatus(startDate: Date, endDate: Date) {
    const today = new Date();

    if (!startDate || !endDate) {
      return 'unknown';
    } else if (today < startDate) {
      return 'FUTURE';
    } else if (today > endDate) {
      return 'PAST';
    } else {
      return 'CURRENT';
    }
  }
}
