import { CollectionsList } from './collection';

export class Comment {
  _id: string;
  _addedBy: string; // object id
  _commentPeriod: string; // object id
  name: string;
  commentNumber: number;
  comment: string;
  commentAuthor: {
    _userId: string; // object id
    orgName: string;
    contactName: string;
    location: string;
    requestedAnonymous: boolean;
    internal: {
      email: string;
      phone: string;
    };
  };
  _documents: string[]; // list of object ids
  review: {
    _reviewerId: string; // object id
    reviewerNotes: string;
    reviewerDate: Date;
  };
  dateAdded: Date;
  commentStatus: string;
  isDeleted: boolean;

  collections: CollectionsList; // used for documents

  constructor(obj?: any) {
    this._id            = obj && obj._id            || null;
    this._addedBy       = obj && obj._addedBy       || null;
    this._commentPeriod = obj && obj._commentPeriod || null;
    this.name           = obj && obj.name           || null;
    this.commentNumber  = obj && obj.commentNumber  || 0;
    this.comment        = obj && obj.comment        || null;
    this.commentAuthor  = obj && obj.commentAuthor  || {};
    this._documents     = obj && obj._documents     || [];
    this.review         = obj && obj.review         || {};
    this.dateAdded      = obj && obj.dateAdded      || null;
    this.commentStatus  = obj && obj.commentStatus  || null;
    this.isDeleted      = obj && obj.isDeleted      || false;
  }
}
