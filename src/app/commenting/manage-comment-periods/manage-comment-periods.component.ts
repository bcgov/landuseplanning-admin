import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { DialogService } from 'ng2-bootstrap-modal';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { CommentPeriod } from '../../models/commentperiod';
import { CommentPeriodService } from '../../services/commentperiod.service';
import { ApiService } from '../../services/api';
import { AddEditCommentPeriodComponent } from './add-edit-comment-period/add-edit-comment-period.component';
import { ConfirmComponent } from '../../confirm/confirm.component';

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
  public alerts: Array<string>;
  public closeResult: string;

  // see official solution:
  // https://stackoverflow.com/questions/38008334/angular-rxjs-when-should-i-unsubscribe-from-subscription
  // or http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
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
    this.commentPeriods = [];
    this.alerts = [];

    this.route.params.subscribe(
      (params: Params) => { this.appId = params.application || '0'; }
    );

    // get application
    this.applicationService.getById(this.appId)
      .takeUntil(this.ngUnsubscribe)
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
    this.commentPeriodService.getAll(this.appId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
      data => {
        this.loading = false;
        this.commentPeriods = data;
        // TODO: calculate and store status for easier UI
      },
      error => {
        this.loading = false;
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        this.alerts.push('Error loading comment periods');
        // console.log(error); // already displayed by handleError()
      });
  }

  addClick() {
    this.dialogService.addDialog(AddEditCommentPeriodComponent,
      {
        title: 'Add Comment Period',
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

  updateClick() {
    this.dialogService.addDialog(AddEditCommentPeriodComponent,
      {
        title: 'Update Comment Period',
        message: 'Update'
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
          console.log('updated');
        } else {
          console.log('canceled');
        }
      });
  }

  deleteClick() {
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
          // TODO: reload page (if not observable binding)?
          console.log('accepted');
        } else {
          console.log('declined');
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getStatus(item: CommentPeriod) {
    const today = new Date();

    if (!item.startDate || !item.endDate) {
      return 'unknown';
    } else if (today < item.startDate) {
      return 'FUTURE';
    } else if (today > item.endDate) {
      return 'PAST';
    } else {
      return 'CURRENT';
    }
  }

}
