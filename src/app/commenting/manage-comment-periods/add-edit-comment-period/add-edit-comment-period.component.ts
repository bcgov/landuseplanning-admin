import { Component } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

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
  delta = 30; // # days including today
  private isNew: boolean;
  cp: CommentPeriod = null;

  constructor(
    public dialogService: DialogService,
    private commentPeriodService: CommentPeriodService
  ) {
    super(dialogService);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    if (!this.commentPeriod) {
      this.isNew = true;
      // create new comment period
      this.cp = new CommentPeriod();
      this.cp._application = this.appId;


      // set initial start date and duration
      const n = new Date();
      this.onDate1Chg({ 'year': n.getFullYear(), 'month': n.getMonth() + 1, 'day': n.getDate() });
      this.onDeltaChg(this.delta);

    } else {
      this.isNew = false;
      // make a **deep copy** of the passed-in comment period so we don't change it
      this.cp = _.cloneDeep(this.commentPeriod);
      this.cp._application = this.appId;

      // set start and end dates
      const s = new Date(this.cp.startDate);
      const e = new Date(this.cp.endDate); // NB: must save e before setting s
      this.onDate1Chg({ 'year': s.getFullYear(), 'month': s.getMonth() + 1, 'day': s.getDate() });
      this.onDate2Chg({ 'year': e.getFullYear(), 'month': e.getMonth() + 1, 'day': e.getDate() });
    }
  }

  onDate1Chg(startDate: NgbDateStruct) {
    if (startDate !== null) {
      this.cp.startDate = new Date(startDate.year, (startDate.month - 1), startDate.day);
      this.setDates(true, false, false);
    }
  }

  onDeltaChg(delta: number) {
    if (delta !== null) {
      this.delta = delta;
      this.setDates(false, true, false);
    }
  }

  onDate2Chg(endDate: NgbDateStruct) {
    if (endDate !== null) {
      this.endDate = endDate;
      this.cp.endDate = new Date(endDate.year, (endDate.month - 1), endDate.day);
      this.setDates(false, false, true);
    }
  }

  private setDates(start?: boolean, delta?: boolean, end?: boolean) {
    if (start) {
      // when start changes, adjust end accordingly
      this.cp.endDate = new Date(this.cp.startDate);
      this.cp.endDate.setDate(this.cp.startDate.getDate() + this.delta - 1);

    } else if (delta) {
      // when delta changes, adjust end accordingly
      this.cp.endDate = new Date(this.cp.startDate);
      this.cp.endDate.setDate(this.cp.startDate.getDate() + this.delta - 1);

    } else if (end) {
      // when end changes, adjust delta accordingly
      // use moment to handle Daylight Saving Time changes
      this.delta = moment(this.cp.endDate).diff(moment(this.cp.startDate), 'days') + 1;
    }

    // update date pickers
    const s = new Date(this.cp.startDate);
    const e = new Date(this.cp.endDate);
    this.startDate = { 'year': s.getFullYear(), 'month': s.getMonth() + 1, 'day': s.getDate() };
    this.endDate = { 'year': e.getFullYear(), 'month': e.getMonth() + 1, 'day': e.getDate() };
  }

  save() {
    if (this.isNew) {
      this.commentPeriodService.add(this.cp)
        .subscribe(
          value => {
            this.result = true;
            this.close();
          },
          error => {
            this.result = false;
            this.close();
          }
        );
    } else {
      this.commentPeriodService.save(this.cp)
        .subscribe(
          value => {
            this.result = true;
            this.close();
          },
          error => {
            this.result = false;
            this.close();
          }
        );
    }
  }
}
