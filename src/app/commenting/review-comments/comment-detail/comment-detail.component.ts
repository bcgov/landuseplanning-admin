import { Component, OnChanges, Input } from '@angular/core';

import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';
// import { ApiService } from 'app/services/api';

@Component({
  selector: 'app-comment-detail',
  templateUrl: './comment-detail.component.html',
  styleUrls: ['./comment-detail.component.scss']
})

export class CommentDetailComponent implements OnChanges {
  @Input() comment: Comment;

  readonly accepted = 'Accepted';
  readonly pending = 'Pending';
  readonly rejected = 'Rejected';

  public internalNotes: string; // working version
  public networkMsg: string;

  constructor(
    // private api: ApiService,
    private commentService: CommentService
  ) { }

  ngOnChanges() {
    this.internalNotes = this.comment.review.reviewerNotes;
  }

  getBadgeClass() {
    switch (this.comment.commentStatus) {
      case this.accepted: return 'badge-success';
      case this.pending: return 'badge-secondary';
      case this.rejected: return 'badge-danger';
      default: return 'badge-light'; // error
    }
  }

  isAccepted() { return (this.comment.commentStatus === this.accepted); }

  isPending() { return (this.comment.commentStatus === this.pending); }

  isRejected() { return (this.comment.commentStatus === this.rejected); }

  accept() {
    this.comment.commentStatus = this.accepted;
    this.save();
  }

  pend() {
    this.comment.commentStatus = this.pending;
    this.save();
  }

  reject() {
    this.comment.commentStatus = this.rejected;
    this.save();
  }

  saveNotes() {
    this.comment.review.reviewerNotes = this.internalNotes;
    this.save();
  }

  resetNotes() {
    this.internalNotes = this.comment.review.reviewerNotes;
  }

  private save() {
    this.comment.review.reviewerDate = new Date();

    this.networkMsg = null;
    // this.api.saveComment(this.comment).subscribe(
    //   data => {
    //     console.log('data', data);
    //   },
    //   error => {
    //     console.log('error', error.json().message);
    //     this.networkMsg = error.json().message;
    //   });

    this.commentService.saveComment(this.comment)
      // .takeUntil(this.ngUnsubscribe)
      .subscribe(
      comments => { },
      error => {
        this.networkMsg = error;
        // console.log(error); // already displayed by handleError()
      });
  }
}
