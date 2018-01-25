import { Component, OnChanges, Input } from '@angular/core';
// import { ChangeDetectorRef } from '@angular/core';

import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';

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
    // private _changeDetectionRef: ChangeDetectorRef,
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
    const newComment = new Comment(this.comment);
    newComment.commentStatus = this.accepted;
    this.save(newComment);
    // this._changeDetectionRef.detectChanges();
  }

  pend() {
    const newComment = new Comment(this.comment);
    newComment.commentStatus = this.pending;
    this.save(newComment);
    // this._changeDetectionRef.detectChanges();
  }

  reject() {
    const newComment = new Comment(this.comment);
    newComment.commentStatus = this.rejected;
    this.save(newComment);
    // this._changeDetectionRef.detectChanges();
  }

  saveNotes() {
    const newComment = new Comment(this.comment);
    newComment.review.reviewerNotes = this.internalNotes;
    this.save(newComment);
  }

  resetNotes() {
    this.internalNotes = this.comment.review.reviewerNotes;
  }

  private save(newComment: Comment) {
    newComment.review.reviewerDate = new Date();
    this.networkMsg = null;
    this.commentService.saveComment(newComment)
      // .takeUntil(this.ngUnsubscribe)
      .subscribe(
      comments => {
        this.comment = newComment; // TODO: or comments[0] ???
      },
      error => {
        this.networkMsg = error;
        // console.log(error); // already displayed by handleError()
      });
  }
}
