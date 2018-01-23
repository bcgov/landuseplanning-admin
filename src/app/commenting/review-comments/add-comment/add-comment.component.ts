import { Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Comment } from '../../../models/comment';
import { CommentService } from '../../../services/comment.service';
import { ApiService } from '../../../services/api';

export interface DataModel {
  title: string;
  message: string;
}

@Component({
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})

export class AddCommentComponent extends DialogComponent<DataModel, boolean> implements DataModel {
  public title: string;
  public message: string;
  public comment: Comment;
  public showAlert: boolean;

  constructor(
    public dialogService: DialogService,
    private commentService: CommentService,
    private api: ApiService
  ) {
    super(dialogService);
    this.showAlert = false;
  }

  save() {
    // we set dialog result as true on click of save button
    // then we can get dialog result from caller code
    this.result = true;
    this.close();
  }
}
