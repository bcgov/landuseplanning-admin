import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';

import { RecentActivityService } from 'app/services/recent-activity';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'tbody[app-activity-detail-table-rows]',
  templateUrl: './activity-detail-table-rows.component.html',
  styleUrls: ['./activity-detail-table-rows.component.scss']
})

export class ActivityDetailTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  @Input() data: TableObject;

  public entries: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public targetActivity: any;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private ngxSmartModalService: NgxSmartModalService,
    private recentActivityService: RecentActivityService,
  ) { }

  async ngOnInit() {
    this.entries = this.data.data;
    this.paginationData = this.data.paginationData;

    this.ngxSmartModalService.getModal('confirmation-modal').onAnyCloseEventFinished
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        const data = this.ngxSmartModalService.getModalData('confirmation-modal');
        if (data.confirmDelete) {
          this.internalDeleteActivity();
        }
      })
  }

  deleteActivity(activity) {
    this.ngxSmartModalService.setModalData({
      type: 'delete',
      title: 'Delete Activity',
      message: 'Click <strong>OK</strong> to delete this Activity or <strong>Cancel</strong> to return to the list.'
    }, 'confirmation-modal', true);

    this.ngxSmartModalService.open('confirmation-modal');
    this.targetActivity = activity;
  }

  internalDeleteActivity() {
    // Delete the Activity
    this.recentActivityService.delete(this.targetActivity)
    .subscribe(
      () => {
        this.entries.splice(this.entries.indexOf(this.targetActivity), 1);
        this._changeDetectionRef.detectChanges();
      },
      error => {
        console.log('error =', error);
      });
  }

  togglePin(activity) {
    activity.pinned === true ? activity.pinned = false : activity.pinned = true;
    this.recentActivityService.save(activity)
      .subscribe(
        () => {
          this._changeDetectionRef.detectChanges();
        },
        error => {
          console.log('error =', error);
        }
      );
  }

  goToItem(activity) {
    console.log('activity:', activity);
    this.router.navigate(['/activity', activity._id, 'edit']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
