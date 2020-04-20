import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { get } from 'lodash';

import { ApiService } from 'app/services/api';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';
import { EmailSubscribe } from 'app/models/emailSubscribe';
import { StorageService } from 'app/services/storage.service';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { EmailSubscribeTableRowsComponent } from './email-subscribe-table-rows/email-subscribe-table-rows.component';

@Component({
  selector: 'app-project-email-subscribe',
  templateUrl: './project-email-subscribe.component.html',
  styleUrls: ['./project-email-subscribe.component.scss']
})
export class ProjectEmailSubscribeComponent implements OnInit {

  public emailSubscribe: EmailSubscribe[] = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public currentProject;
  public loading = true;
  public tableData: TableObject;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableColumns: any[] = [
    {
      name: 'Email Address',
      value: 'emailAddress',
      width: 'col-5',
      nosort: true
    },
    {
      name: 'Date Subscribed',
      value: 'dateSubscribed',
      width: 'col-3',
      nosort: true
    },
    {
      name: 'Email Confirmed',
      value: 'emailConfirmed',
      width: 'col-3',
      nosort: true
    },
    {
      name: 'Delete',
      //value: 'emailConfirmed',
      width: 'col-1',
      nosort: true
    }
  ];

  constructor(
    private api: ApiService,
    private emailSubscribeService: EmailSubscribeService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils,
  ) { }

  ngOnInit(): void {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
      });

    this.emailSubscribeService.getAll(this.currentProject._id)
      .toPromise()
      .then((emailSubscribe: EmailSubscribe) => {
        this.emailSubscribe = get(emailSubscribe, 'data');
        //return emailSubscribe;
        this.setRowData();
        this.loading = false;
      })
      .catch(error => {
        console.log('error', error);
        // alert('Uh-oh, error getting email address');
      });
  }

  setRowData() {
    let list = [];
    if (this.emailSubscribe && this.emailSubscribe.length > 0) {
      this.emailSubscribe.forEach(email => {
        list.push(
          {
            emailAddress: email.email,
            dateSubscribed: email.dateSubscribed,
            confirmed: email.confirmed
          }
        );
      });
      console.log('List', list);
      this.tableData = new TableObject(
        EmailSubscribeTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

}
