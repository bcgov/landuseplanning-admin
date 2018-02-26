import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/toPromise';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ApiService } from 'app/services/api';

import { AddEditCommentPeriodComponent } from './add-edit-comment-period/add-edit-comment-period.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';

@Component({
  selector: 'app-manage-comment-periods',
  templateUrl: './manage-comment-periods.component.html',
  styleUrls: ['./manage-comment-periods.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  public alerts: Array<string>;

  // see official solution:
  // https://stackoverflow.com/questions/38008334/angular-rxjs-when-should-i-unsubscribe-from-subscription
  // or http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private _changeDetectionRef: ChangeDetectorRef,
    private commentPeriodService: CommentPeriodService,
    private api: ApiService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.refreshUI();
  }

  private refreshUI() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.loading = true;
    this.appId = null;
    this.application = null;
    this.commentPeriods = [];
    this.alerts = [];

    // get route parameters
    this.appId = this.route.snapshot.queryParamMap.get('application');

    // get application
    // this is independent of comment periods data
    this.applicationService.getById(this.appId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        application => {
          this.application = application;
          this._changeDetectionRef.detectChanges();
        },
        error => {
          // If 403, redir to /login.
          if (error.startsWith('403')) {
            this.router.navigate(['/login']);
          }
          this.alerts.push('Error loading application');
        });

    // get comment periods
    // this is independent of application data
    this.commentPeriodService.getAllByApplicationId(this.appId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        periods => {
          this.loading = false;
          this.commentPeriods = periods;
          this._changeDetectionRef.detectChanges();
          // TODO: calculate and store status for easier UI
        },
        error => {
          this.loading = false;
          // If 403, redir to /login.
          if (error.startsWith('403')) {
            this.router.navigate(['/login']);
          }
          this.alerts.push('Error loading comment periods');
        });
  }

  public openCommentPeriod(commentPeriod: CommentPeriod, appId: string) {
    if (commentPeriod) {
      console.log('cp:', commentPeriod);
      this.dialogService.addDialog(AddEditCommentPeriodComponent,
        {
          title: 'Update Comment Period',
          message: 'Update',
          commentPeriod: commentPeriod,
          appId: appId
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
            this.refreshUI();
          }
        });
    } else {
      this.dialogService.addDialog(AddEditCommentPeriodComponent,
        {
          title: 'Add Comment Period',
          message: 'Save',
          commentPeriod: null,
          appId: appId
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
            this.refreshUI();
          }
        });
    }
  }

  private deleteCommentPeriod(commentPeriod: CommentPeriod) {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Confirm deletion',
        message: 'Do you really want to delete this comment period?'
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
          //  Delete then refresh
          // TODO: should use service
          this.api.deleteCommentPeriod(commentPeriod).subscribe(
            data => {
              console.log('accepted');
              this.refreshUI();
            }, error => {
              // TODO: Add alert
              console.log('Something bad happened:', error);
            });
        } else {
          console.log('declined');
        }
      });
  }

  publishCommentPeriod(commentPeriod: CommentPeriod) {
    return this.commentPeriodService.publish(commentPeriod)
      .toPromise()
      // HACK: refresh UI because template item isn't being refreshed otherwise
      .then(value => this.refreshUI());
  }

  unPublishCommentPeriod(commentPeriod: CommentPeriod) {
    return this.commentPeriodService.unPublish(commentPeriod)
      .toPromise()
      // HACK: refresh UI because template item isn't being refreshed otherwise
      .then(value => this.refreshUI());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getStatus(item: CommentPeriod): string {
    if (!item || !item.startDate || !item.endDate) {
      return 'unknown';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);

    if (endDate < today) {
      return 'PAST';
    } else if (startDate > today) {
      return 'FUTURE';
    } else {
      return 'CURRENT';
    }
  }
}
