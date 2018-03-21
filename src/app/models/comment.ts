import * as _ from 'lodash';
import { Document } from './document';

class Internal {
  email: string;
  phone: string;
  tags: Array<string>;

  constructor(obj?: any) {
    this.email = obj && obj.email || null;
    this.phone = obj && obj.phone || null;
  }
}

class CommentAuthor {
  _userId: string; // object id -> User
  orgName: string;
  contactName: string;
  location: string;
  requestedAnonymous: boolean;
  internal: Internal;
  tags: Array<string>;

  constructor(obj?: any) {
    this._userId            = obj && obj._userId            || null;
    this.orgName            = obj && obj.orgName            || null;
    this.contactName        = obj && obj.contactName        || null;
    this.location           = obj && obj.location           || null;
    this.requestedAnonymous = obj && obj.requestedAnonymous || null;
    this.internal           = obj && obj.internal           || new Internal();
  }
}

class Review {
  _reviewerId: string; // object id -> User
  reviewerNotes: string;
  reviewerDate: Date;
  tags: Array<string>;

  constructor(obj?: any) {
    this._reviewerId    = obj && obj._reviewerId    || null;
    this.reviewerNotes  = obj && obj.reviewerNotes  || null;
    this.reviewerDate   = obj && obj.reviewerDate   || null;
  }
}

export class Comment {
  _id: string;
  _addedBy: string; // object id -> User
  _commentPeriod: string; // object id -> CommentPeriod
  commentNumber: number;
  comment: string;
  commentAuthor: CommentAuthor;
  review: Review;
  dateAdded: Date;
  commentStatus: string;
  tags: Array<string>;

  documents: Array<Document>;
  isPublished = false;

  constructor(obj?: any) {
    this._id            = obj && obj._id            || null;
    this._addedBy       = obj && obj._addedBy       || null;
    this._commentPeriod = obj && obj._commentPeriod || null;
    this.commentNumber  = obj && obj.commentNumber  || 0;
    this.comment        = obj && obj.comment        || null;
    this.commentAuthor  = obj && obj.commentAuthor  || new Comment();
    this.review         = obj && obj.review         || new Review();
    this.dateAdded      = obj && obj.dateAdded      || null;
    this.commentStatus  = obj && obj.commentStatus  || null;

    this.documents = [];

    // Wrap isPublished around the tags we receive for this object.
    if (obj && obj.tags) {
      const self = this;
      _.each(obj.tags, function (tag) {
        if (_.includes(tag, 'public')) {
          self.isPublished = true;
        }
      });
    }
  }
}
