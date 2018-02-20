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
    if (this.comment) {
      this.internalNotes = this.comment.review.reviewerNotes;
    }
  }

  private getBadgeClass(): string {
    switch (this.comment.commentStatus) {
      case this.accepted: return 'badge-success';
      case this.pending: return 'badge-secondary';
      case this.rejected: return 'badge-danger';
      default: return 'badge-light'; // error
    }
  }

  private isAccepted(): boolean { return (this.comment.commentStatus === this.accepted); }

  private isPending(): boolean { return (this.comment.commentStatus === this.pending); }

  private isRejected(): boolean { return (this.comment.commentStatus === this.rejected); }

  private doAccept() {
    if (this.comment.commentStatus !== this.accepted) {
      this.comment.commentStatus = this.accepted;
      this.save(this.comment);
    }
  }

  private doPending() {
    if (this.comment.commentStatus !== this.pending) {
      this.comment.commentStatus = this.pending;
      this.save(this.comment);
    }
  }

  private doReject() {
    if (this.comment.commentStatus !== this.rejected) {
      this.comment.commentStatus = this.rejected;
      this.save(this.comment);
    }
  }

  private saveNotes() {
    if (!this.isNotesPristine()) {
      this.comment.review.reviewerNotes = this.internalNotes;
      this.save(this.comment);
    }
  }

  private isNotesPristine(): boolean {
    // TODO: debounce this?
    return (this.comment.review.reviewerNotes === this.internalNotes);
  }

  private resetNotes() {
    this.internalNotes = this.comment.review.reviewerNotes;
  }

  private save(comment: Comment) {
    comment.review.reviewerDate = new Date();

    this.networkMsg = null;
    this.commentService.save(comment)
      // .takeUntil(this.ngUnsubscribe)
      .subscribe(
        value => {
          // save succeeded - accept new record
          this.comment = value;
          this.commentChange.emit(this.comment);
        },
        error => {
          this.networkMsg = error;
        });
  }
}
