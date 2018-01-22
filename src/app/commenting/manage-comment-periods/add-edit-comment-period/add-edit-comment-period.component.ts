import { Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { CommentPeriod } from '../../../models/commentperiod';
import { CommentPeriodService } from '../../../services/commentperiod.service';
import { ApiService } from '../../../services/api';

export interface DataModel {
  title: string;
  message: string;
}

@Component({
  templateUrl: './add-edit-comment-period.component.html',
  styleUrls: ['./add-edit-comment-period.component.scss']
})

export class AddEditCommentPeriodComponent extends DialogComponent<DataModel, boolean> implements DataModel {
  public title: string;
  public message: string;
  public commentPeriod: CommentPeriod;

  constructor(
    public dialogService: DialogService,
    private commentPeriodService: CommentPeriodService,
    private api: ApiService
  ) {
    super(dialogService);
  }

  save() {
    // we set dialog result as true on click of save button
    // then we can get dialog result from caller code
    this.result = true;
    this.close();
  }

  onSubmit() {
    alert('on submit');
    // this.router.navigate(['search', this.terms.getParams()]);
  }
}
