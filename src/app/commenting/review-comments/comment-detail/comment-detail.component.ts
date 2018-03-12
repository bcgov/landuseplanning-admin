import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';

interface SaveParameters {
  comment: Comment;
  doPublish?: boolean;
  doUnpublish?: boolean;
}

@Component({
  selector: 'app-comment-detail',
  templateUrl: './comment-detail.component.html',
  styleUrls: ['./comment-detail.component.scss']
})

export class CommentDetailComponent implements OnChanges {
  @Input() comment: Comment;
  @Output() commentChange = new EventEmitter<Comment>();

  public internalNotes: string; // working version
  public networkMsg: string;
  private documents: Array<Document>;

  constructor(
    private api: ApiService, // used in template
    private commentService: CommentService,
    private documentService: DocumentService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.comment.currentValue) {
      // console.log('changes =', changes);

      // save copy of notes for possible reset
      this.internalNotes = this.comment.review.reviewerNotes;

      // get the comment documents
      this.documentService.getAllByCommentId(this.comment._id).subscribe(
        (documents: Document[]) => this.documents = documents,
        error => console.log(error)
      );
    }
  }

  private doAccept(comment: Comment) {
    if (!this.commentService.isAccepted(comment)) {
      this.commentService.doAccept(comment);
      this.save({ comment: this.comment, doPublish: true });
    }
  }

  private doPending(comment: Comment) {
    if (!this.commentService.isPending(comment)) {
      this.commentService.doPending(comment);
      this.save({ comment: this.comment, doUnpublish: true });
    }
  }

  private doReject(comment: Comment) {
    if (!this.commentService.isRejected(comment)) {
      this.commentService.doReject(comment);
      this.save({ comment: this.comment, doUnpublish: true });
    }
  }

  private saveNotes() {
    if (!this.isNotesPristine()) {
      this.comment.review.reviewerNotes = this.internalNotes;
      this.save({ comment: this.comment });
    }
  }

  private isNotesPristine(): boolean {
    // TODO: debounce this?
    return (this.comment.review.reviewerNotes === this.internalNotes);
  }

  private resetNotes() {
    this.internalNotes = this.comment.review.reviewerNotes;
  }

  private save({ comment, doPublish = false, doUnpublish = false }: SaveParameters) {
    comment.review.reviewerDate = new Date();

    this.networkMsg = null;
    this.commentService.save(this.comment)
      .toPromise()
      .then(
        () => {
          // save succeeded
          // just hold on to existing comment instead of reloading it
          this.commentChange.emit(this.comment);
        },
        reason => {
          this.networkMsg += reason;
        }
      )
      .then(
        () => {
          if (doPublish && !this.comment.isPublished) {
            this.commentService.publish(this.comment);
            this.documents.forEach((document) => this.documentService.publish(document));
          }
          if (doUnpublish && this.comment.isPublished) {
            this.commentService.unPublish(this.comment);
            this.documents.forEach((document) => this.documentService.unPublish(document));
          }
        },
        reason => {
          this.networkMsg += reason;
        }
      )
      .catch(reason => {
        this.networkMsg += reason;
      });
  }
}
