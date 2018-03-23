import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';

export interface DataModel {
  title: string; // not used
  message: string; // not used
  periodId: string;
}

@Component({
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})

// NOTE: dialog components must not implement OnDestroy
//       otherwise they don't return a result
export class AddCommentComponent extends DialogComponent<DataModel, boolean> implements DataModel, OnInit {
  public title: string;
  public message: string;
  public periodId: string;

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
  }

  save() {
    // we set dialog result as true on click of save button
    // then we can get dialog result from caller code
    this.result = true;
    alert('Save is not yet implemented');
    // this.close();
  }
}
