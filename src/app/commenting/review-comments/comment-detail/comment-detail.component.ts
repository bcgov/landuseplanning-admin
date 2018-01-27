import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';

@Component({
  selector: 'app-comment-detail',
  templateUrl: './comment-detail.component.html',
  styleUrls: ['./comment-detail.component.scss']
})

export class CommentDetailComponent implements OnChanges {
  @Input() comment: Comment;
  @Output() commentChange = new EventEmitter<Comment>();

  readonly accepted = 'Accepted';
  readonly pending = 'Pending';
  readonly rejected = 'Rejected';

  public internalNotes: string; // working version
  public networkMsg: string;

  constructor(
    private commentService: CommentService
  ) { }

  ngOnChanges() {
    this.internalNotes = this.comment.review.reviewerNotes;
  }

  private getBadgeClass() {
    switch (this.comment.commentStatus) {
      case this.accepted: return 'badge-success';
      case this.pending: return 'badge-secondary';
      case this.rejected: return 'badge-danger';
      default: return 'badge-light'; // error
    }
  }

  private isAccepted() { return (this.comment.commentStatus === this.accepted); }

  private isPending() { return (this.comment.commentStatus === this.pending); }

  private isRejected() { return (this.comment.commentStatus === this.rejected); }

  private accept() {
    if (this.comment.commentStatus !== this.accepted) {
      const newComment = new Comment(this.comment);
      newComment.commentStatus = this.accepted;
      this.save(newComment);
    }
  }

  private pend() {
    if (this.comment.commentStatus !== this.pending) {
      const newComment = new Comment(this.comment);
      newComment.commentStatus = this.pending;
      this.save(newComment);
    }
  }

  private reject() {
    if (this.comment.commentStatus !== this.rejected) {
      const newComment = new Comment(this.comment);
      newComment.commentStatus = this.rejected;
      this.save(newComment);
    }
  }

  private saveNotes() {
    if (this.comment.review.reviewerNotes !== this.internalNotes) {
      const newComment = new Comment(this.comment);
      newComment.review.reviewerNotes = this.internalNotes;
      this.save(newComment);
    }
  }

  private resetNotes() {
    this.internalNotes = this.comment.review.reviewerNotes;
  }

  private save(newComment: Comment) {
    newComment.review.reviewerDate = new Date();

    this.networkMsg = null;
    this.commentService.save(newComment)
      // .takeUntil(this.ngUnsubscribe)
      .subscribe(
      comment => {
        // save succeeded - accept new record
        this.comment = comment;
        this.commentChange.emit(this.comment);
      },
      error => {
        this.networkMsg = error;
      });
  }
}
