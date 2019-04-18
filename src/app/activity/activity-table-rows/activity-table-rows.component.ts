import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { ConfirmComponent } from 'app/confirm/confirm.component';
// import { AddEditActivityComponent } from '../add-edit-activity/add-edit-activity.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs';
import { SearchService } from 'app/services/search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'tbody[app-activity-table-rows]',
  templateUrl: './activity-table-rows.component.html',
  styleUrls: ['./activity-table-rows.component.scss']
})

export class ActivityTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;

  public entries: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  private projectList: Project[] = [];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private dialogService: DialogService,
    private modalService: NgbModal,
    private projectService: ProjectService
    // private activityService: SearchService,
  ) { }

  async ngOnInit() {
    this.entries = this.data.data;
    this.paginationData = this.data.paginationData;

    // Promise.all(this.data.data.map(async item => {
    //   if (item.project) {
    //     let res = await this.projectService.getById(item.project).toPromise();
    //     item.projectName = res.name;
    //     this._changeDetectionRef.detectChanges();
    //   }
    // }));
  }

  deleteActivity(activity) {
    // this.dialogService.addDialog(ConfirmComponent,
    //   {
    //     title: 'Delete Valued Component',
    //     message: 'Click <strong>OK</strong> to delete this Activity or <strong>Cancel</strong> to return to the list.'
    //   }, {
    //     backdropColor: 'rgba(0, 0, 0, 0.5)'
    //   })
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(
    //     isConfirmed => {
    //       if (isConfirmed) {
    //         // Delete the VC
    //         this.activityService.delete(activity)
    //           .subscribe(
    //             () => {
    //               this.activities.splice(this.activities.indexOf(activity), 1);
    //               this.changeDetectorRef.detectChanges();
    //             },
    //             error => {
    //               console.log('error =', error);
    //             });
    //       }
    //     }
    //   );
  }

  editActivity(activity) {
    // let dlg = this.modalService.open(AddEditActivityComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    // dlg.componentInstance.model = activity;
    // dlg.result.then(result => {
    //   if (result.isSaved) {
    //     let newActivityArray = [];
    //     this.activities.filter(x => {
    //       if (x._id === result.newActivity._id) {
    //         newActivityArray.push({
    //           description: result.newActivity.description,
    //           name: result.newActivity.name,
    //           pillar: result.newActivity.pillar,
    //           type: result.newActivity.type,
    //           _id: result.newActivity._id
    //         });
    //       } else {
    //         newActivityArray.push(x);
    //       }
    //       this.activities = newActivityArray;
    //       this.changeDetectorRef.detectChanges();
    //     });
    //   }
    // });
    // return;
  }

  selectItem(item, activity) {
    switch (item) {
      case 'Edit': {
        this.editActivity(activity);
        break;
      }
      case 'Delete': {
        this.deleteActivity(activity);
        break;
      }
      default: {
        break;
      }
    }
  }
}
