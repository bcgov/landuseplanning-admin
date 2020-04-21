import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableComponent } from 'app/shared/components/table-template/table.component';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'tbody[app-email-subscribe-table-rows]',
  templateUrl: './email-subscribe-table-rows.component.html',
  styleUrls: ['./email-subscribe-table-rows.component.scss']
})
export class EmailSubscribeTableRowsComponent implements OnInit, TableComponent {

  @Input() data: TableObject;

  public entries: any;
  public targetEmail: any;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private emailSubscribeService: EmailSubscribeService,
    private ngxSmartModalService: NgxSmartModalService,
  ) { }

  async ngOnInit() {
    //console.log('This.data', this.data);
    this.entries = this.data.data;
    this.ngxSmartModalService.getModal('confirmation-modal').onAnyCloseEventFinished
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        const data = this.ngxSmartModalService.getModalData('confirmation-modal');
        if (data.deleteConfirm) {
          this.internalDeleteActivity();
        }
      })
  }

  deleteEmail(emailAddress) {
    // toss up a confirmation
    this.ngxSmartModalService.setModalData({
      type: 'delete',
      title: 'Delete Activity',
      message: 'Click <strong>OK</strong> to delete this Email Address or <strong>Cancel</strong> to return to the list.'
    }, 'confirmation-modal', true);

    this.ngxSmartModalService.open('confirmation-modal');
    this.targetEmail = emailAddress;

    
  }

  internalDeleteActivity() {
    // Delete the Activity

    this.emailSubscribeService.deleteEmail(this.targetEmail)
      .subscribe(
        () => {
          this.entries.splice(this.entries.indexOf(this.targetEmail), 1);
          this._changeDetectionRef.detectChanges();
        },
        error => {
          console.log('error =', error);
        });
  }

}
