import * as _ from 'lodash';
import { Document } from './document';

class Internal {
  email: string;
  phone: string;
  tags: Array<string>;

  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this.email = obj && obj.email || null;
    this.phone = obj && obj.phone || null;

    // wrap isPublished around the tags we receive for this object
    if (obj && obj.tags) {
      for (const tag of obj.tags) {
        if (_.includes(tag, 'public')) {
          this.isPublished = true;
          break;
        }
      }
    }
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

  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._userId            = obj && obj._userId            || null;
    this.orgName            = obj && obj.orgName            || null;
    this.contactName        = obj && obj.contactName        || null;
    this.location           = obj && obj.location           || null;
    this.requestedAnonymous = obj && obj.requestedAnonymous || null;

    this.internal           = new Internal(obj && obj.internal || null);

    // wrap isPublished around the tags we receive for this object
    if (obj && obj.tags) {
      for (const tag of obj.tags) {
        if (_.includes(tag, 'public')) {
          this.isPublished = true;
          break;
        }
      }
    }
  }
}

class Review {
  _reviewerId: string; // object id -> User
  reviewerNotes: string = null;
  reviewerDate: Date;
  tags: Array<string>;

  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._reviewerId    = obj && obj._reviewerId    || null;
    this.reviewerDate   = obj && obj.reviewerDate   || null;

    // replace \\n (JSON format) with newlines
    if (obj && obj.reviewerNotes) {
      this.reviewerNotes = obj.reviewerNotes.replace(/\\n/g, '\n');
    }

    // wrap isPublished around the tags we receive for this object
    if (obj && obj.tags) {
      for (const tag of obj.tags) {
        if (_.includes(tag, 'public')) {
          this.isPublished = true;
          break;
        }
      }
    }
  }
}

export class Comment {
  _id: string;
  _addedBy: string;
  _commentPeriod: string; // object id -> CommentPeriod
  commentNumber: number;
  comment: string = null;
  commentAuthor: CommentAuthor;
  review: Review;
  dateAdded: Date;
  commentStatus: string;
  tags: Array<string>;

  documents: Array<Document> = [];

  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._id            = obj && obj._id            || null;
    this._addedBy       = obj && obj._addedBy       || null;
    this._commentPeriod = obj && obj._commentPeriod || null;
    this.commentNumber  = obj && obj.commentNumber  || 0;
    this.dateAdded      = obj && obj.dateAdded      || null;
    this.commentStatus  = obj && obj.commentStatus  || null;

    this.commentAuthor  = new CommentAuthor(obj && obj.commentAuthor || null);
    this.review         = new Review(obj && obj.review || null);

    // replace \\n (JSON format) with newlines
    if (obj && obj.comment) {
      this.comment = obj.comment.replace(/\\n/g, '\n');
    }

    // copy documents
    if (obj && obj.documents) {
      for (const doc of obj.documents) {
        this.documents.push(doc);
      }
    }

    // wrap isPublished around the tags we receive for this object
    if (obj && obj.tags) {
      for (const tag of obj.tags) {
        if (_.includes(tag, 'public')) {
          this.isPublished = true;
          break;
        }
      }
    }
  }
}
