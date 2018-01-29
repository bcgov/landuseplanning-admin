import { Component } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

import { Application } from 'app/models/application';
import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';

export interface DataModel {
  title: string; // not used
  message: string; // not used
  periodId: string;
  commentNumber: number;
}
@Component({
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})

export class AddCommentComponent extends DialogComponent<DataModel, boolean> implements DataModel {
  public title: string;
  public message: string;
  public periodId: string;
  public commentNumber: number;

  public comment: Comment;
  public dateAdded: NgbDateStruct;
  public showAlert: boolean; // for attachment error

  constructor(
    public dialogService: DialogService,
    private commentService: CommentService
  ) {
    super(dialogService);
    this.showAlert = false;
  }

  ngOnInit() {
    console.log('period id=', this.periodId);
    console.log('comment number=', this.commentNumber);
  }

  save() {
    // we set dialog result as true on click of save button
    // then we can get dialog result from caller code
    this.result = true;
    alert('Save is not yet implemented');
    // this.close();
  }
}
