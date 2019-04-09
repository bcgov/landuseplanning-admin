import * as _ from 'lodash';

export class Document {
  _id: string;
  project: string;

  // System
  _comment: string; // objectid -> Comment
  _createdDate: string;
  _updatedDate: string;
  _addedBy: string;
  _updatedBy: string;
  _deletedBy: string;

  documentFileName: string;
  internalURL: string;
  passedAVCheck: boolean;
  internalMime: string;
  internalSize: string;
  documentSource: string;

  displayName: string;
  milestone: string;
  uploadDate: string;
  documentDate: string;
  type: string;
  description: string;
  documentAuthor: string;

  checkbox: boolean;
  upfile: File;
  labels: any[];
  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._id              = obj && obj._id              || null;
    this.project              = obj && obj.project              || null;

    this._comment         = obj && obj._comment         || null;
    this._createdDate         = obj && obj._createdDate         || null;
    this._updatedDate         = obj && obj._updatedDate         || null;
    this._addedBy         = obj && obj._addedBy         || null;
    this._updatedBy         = obj && obj._updatedBy         || null;
    this._deletedBy         = obj && obj._deletedBy         || null;

    this.documentFileName = obj && obj.documentFileName || null;
    this.internalURL      = obj && obj.internalURL      || null;
    this.passedAVCheck      = obj && obj.passedAVCheck      || null;
    this.internalMime     = obj && obj.internalMime     || null;
    this.internalSize      = obj && obj.internalSize      || null;
    this.documentSource      = obj && obj.documentSource      || null;

    this.displayName      = obj && obj.displayName      || null;
    this.milestone      = obj && obj.milestone      || null;
    this.uploadDate      = obj && obj.uploadDate      || null;
    this.documentDate      = obj && obj.documentDate      || null;
    this.type      = obj && obj.type      || null;
    this.description      = obj && obj.description      || null;
    this.documentAuthor      = obj && obj.documentAuthor      || null;

    this.checkbox         = obj && obj.checkbox         || null;
    this.upfile     = obj && obj.upfile     || null;
    this.labels     = obj && obj.labels     || null;

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
