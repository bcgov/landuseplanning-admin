import { Document } from './document';

export class Comment {
  _id: string;
  _addedBy: string; // object id -> User
  _commentPeriod: string; // object id -> CommentPeriod
  commentNumber: number;
  comment: string;
  commentAuthor: {
    _userId: string; // object id -> User
    orgName: string;
    contactName: string;
    location: string;
    requestedAnonymous: boolean;
    internal: {
      email: string;
      phone: string;
    };
  };
  _documents: string[]; // list of object ids -> Document
  review: {
    _reviewerId: string; // object id -> User
    reviewerNotes: string;
    reviewerDate: Date;
  };
  dateAdded: Date;
  commentStatus: string;

  documents: Array<Document>;

  constructor(obj?: any) {
    this._id            = obj && obj._id            || null;
    this._addedBy       = obj && obj._addedBy       || null;
    this._commentPeriod = obj && obj._commentPeriod || null;
    this.commentNumber  = obj && obj.commentNumber  || 0;
    this.comment        = obj && obj.comment        || null;
    this.commentAuthor  = obj && obj.commentAuthor  || {};
    this._documents     = obj && obj._documents     || [];
    this.review         = obj && obj.review         || {};
    this.dateAdded      = obj && obj.dateAdded      || null;
    this.commentStatus  = obj && obj.commentStatus  || null;

    this.documents = new Array<Document>();
  }
}
