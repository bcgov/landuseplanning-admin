import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RecentActivityService } from 'app/services/recent-activity';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { StorageService } from 'app/services/storage.service'

@Component({
  selector: 'tbody[app-project-updates-table-rows]',
  templateUrl: './project-updates-table-rows.component.html',
  styleUrls: ['./project-updates-table-rows.component.scss']
})

export class ProjectUpdatesTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  @Input() data: TableObject;

  public entries: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public targetActivity: any;
  public currentProject: any;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private ngxSmartModalService: NgxSmartModalService,
    private recentActivityService: RecentActivityService,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    this.entries = this.data.data;
    this.paginationData = this.data.paginationData;
    this.currentProject = this.storageService.state.currentProject.data;

    this.ngxSmartModalService.getModal('confirmation-modal').onAnyCloseEventFinished
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        const data = this.ngxSmartModalService.getModalData('confirmation-modal');
        if (data.deleteConfirm) {
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
    this.router.navigate(['p', this.currentProject._id, 'project-updates', activity._id , 'edit']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
