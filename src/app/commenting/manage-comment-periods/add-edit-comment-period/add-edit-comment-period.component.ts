import { Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

export interface DataModel {
  title: string;
  message: string;
}

@Component({
  templateUrl: './add-edit-comment-period.component.html',
  styleUrls: ['./add-edit-comment-period.component.scss']
})

export class AddEditCommentPeriodComponent extends DialogComponent<DataModel, boolean> implements DataModel {
  title: string;
  message: string;

  constructor(dialogService: DialogService) {
    super(dialogService);
  }

  save() {
    // we set dialog result as true on click of save button
    // then we can get dialog result from caller code
    this.result = true;
    this.close();
  }
}
