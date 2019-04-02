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

    this.internal = new Internal(obj && obj.internal || null);

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
  author: string;
  comment: string;
  commentId: number;
  dateAdded: Date;
  dateUpdated: Date;
  isAnonymous: boolean;
  location: string;
  eaoStatus: string;
  period: string;

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  constructor(obj?: any) {
    this._id            = obj && obj._id         || null;
    this.author         = obj && obj.author      || null;
    this.commentId      = obj && obj.commentId   || null;
    this.dateAdded      = obj && obj.dateAdded   || null;
    this.dateUpdated    = obj && obj.dateUpdated || null;
    this.delete         = obj && obj.delete      || null;
    this.isAnonymous    = obj && obj.isAnonymous || null;
    this.location       = obj && obj.location    || null;
    this.eaoStatus       = obj && obj.eaoStatus    || null;
    this.period         = obj && obj.period      || null;
    this.read           = obj && obj.read        || null;
    this.write          = obj && obj.write       || null;

    if (obj && obj.dateAdded) {
      this.dateAdded = new Date(obj.dateAdded);
    }

    // replace \\n (JSON format) with newlines
    if (obj && obj.comment) {
      this.comment = obj.comment.replace(/\\n/g, '\n');
    }
  }
}
