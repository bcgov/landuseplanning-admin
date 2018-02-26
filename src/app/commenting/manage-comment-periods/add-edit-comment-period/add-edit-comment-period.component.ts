import { Component } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import * as moment from 'moment-timezone';

import { CommentPeriod } from 'app/models/commentperiod';
import { CommentPeriodService } from 'app/services/commentperiod.service';

export interface DataModel {
  title: string; // not used
  message: string; // not used
  commentPeriod: CommentPeriod;
  appId: string;
}

@Component({
  templateUrl: './add-edit-comment-period.component.html',
  styleUrls: ['./add-edit-comment-period.component.scss']
})

export class AddEditCommentPeriodComponent extends DialogComponent<DataModel, boolean> implements DataModel {
  public title: string;
  public message: string;
  public commentPeriod: CommentPeriod;
  public appId: string;

  startDate: NgbDateStruct;
  endDate: NgbDateStruct;
  isNew: boolean;
  networkMsg: string;
  comment: CommentPeriod;

  constructor(
    public dialogService: DialogService,
    private commentPeriodService: CommentPeriodService
  ) {
    super(dialogService);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.comment = new CommentPeriod(this.commentPeriod);
    if (this.commentPeriod === null) {
      this.isNew = true;
      this.comment.internal = { 'notes': '', '_addedBy': '' };
    } else {
      this.isNew = false;
    }
    this.comment._application = this.appId;
    this.comment.startDate = this.comment.startDate || new Date();
    this.comment.endDate = this.comment.endDate || new Date();
    const startD = new Date(this.comment.startDate);
    const endD = new Date(this.comment.endDate);
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
    this.result = false;

    this.comment.startDate = moment(this.startDate.year
      + '-' + this.startDate.month
      + '-' + this.startDate.day, 'YYYY-MM-DD').utc().format();

    this.comment.endDate = moment(this.endDate.year
      + '-' + this.endDate.month
      + '-' + this.endDate.day, 'YYYY-MM-DD').utc().format();

    if (this.isNew) {
      this.commentPeriodService.add(this.comment).subscribe(
        data => {
          this.result = true;
          this.isNew = false;
          this.close();
        },
        error => {
          this.networkMsg = error;
          this.close();
        });
    } else {
      this.commentPeriodService.save(this.comment).subscribe(
        data => {
          this.result = true;
          this.isNew = false;
          this.close();
        },
        error => {
          this.networkMsg = error;
          this.close();
        });
    }
  }
}
