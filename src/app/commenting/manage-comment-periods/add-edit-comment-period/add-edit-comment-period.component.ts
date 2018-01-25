import { Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { CommentPeriod } from '../../../models/commentperiod';
import { CommentPeriodService } from '../../../services/commentperiod.service';
import { ApiService } from '../../../services/api';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

export interface DataModel {
  title: string;
  message: string;
  model: CommentPeriod;
  application: any;
}

@Component({
  templateUrl: './add-edit-comment-period.component.html',
  styleUrls: ['./add-edit-comment-period.component.scss']
})

export class AddEditCommentPeriodComponent extends DialogComponent<DataModel, boolean> implements DataModel {
  public title: string;
  public message: string;
  public commentPeriod: CommentPeriod;
  startDate: NgbDateStruct;
  endDate: NgbDateStruct;
  isNew: boolean;
  model: CommentPeriod;
  application: any;
  networkMsg: string;
  comm: CommentPeriod;

  constructor(
    public dialogService: DialogService,
    private commentPeriodService: CommentPeriodService,
    private api: ApiService
  ) {
    super(dialogService);
  }

  ngOnInit() {
    if (this.model === null) {
      this.isNew = true;
    } else {
      this.isNew = false;
    }
    this.comm = new CommentPeriod(this.model);
    this.comm._application = this.application;
    this.comm.startDate = new Date();
    this.comm.endDate = new Date();
    const startD = new Date(this.comm.startDate);
    const endD = new Date(this.comm.endDate);
    this.startDate = {
      'year': startD.getFullYear(),
      'month': startD.getMonth() + 1,
      'day': startD.getDate()
    };
    this.endDate = {
      'year': endD.getFullYear(),
      'month': endD.getMonth() + 1,
      'day': endD.getDate()
    };
  }

  save() {
    this.result = true;
    this.comm.startDate = moment(this.startDate.year
      + '-' + this.startDate.month
      + '-' + this.startDate.day, 'YYYY-MM-DD').utc().format();

    this.comm.endDate = moment(this.endDate.year
      + '-' + this.endDate.month
      + '-' + this.endDate.day, 'YYYY-MM-DD').utc().format();

    if (this.isNew) {
      this.api.addCommentPeriod(this.comm).subscribe(
        data => {
          console.log('data', data);
          this.result = true;
          this.isNew = false;
          this.close();
        },
        error => {
          console.log('error', error.json().message);
          this.networkMsg = error.json().message;
        });
    } else {
      this.api.saveCommentPeriod(this.comm).subscribe(
        data => {
          console.log('data', data);
          this.result = true;
          this.isNew = false;
          this.close();
        },
        error => {
          console.log('error', error.json().message);
          this.networkMsg = error.json().message;
        });
    }

    this.close();
  }
}
