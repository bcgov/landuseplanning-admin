import * as _ from 'lodash';

export class Document {
  _id: string;
  _addedBy: string;
  _application: string; // objectid -> Application
  _decision: string; // objectid -> Decision
  _comment: string; // objectid -> Comment
  documentFileName: string;
  displayName: string;
  documentType: string;
  datePosted: string;
  documentFileSize: string;
  internalURL: string;
  isDeleted: boolean;
  internalMime: string;
  tags: Array<string>;
  checkbox: boolean;
  project: string;
  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._id              = obj && obj._id              || null;
    this.project              = obj && obj.project              || null;
    this._addedBy         = obj && obj._addedBy         || null;
    this._application     = obj && obj._application     || null;
    this._decision        = obj && obj._decision        || null;
    this._comment         = obj && obj._comment         || null;
    this.checkbox         = obj && obj.checkbox         || null;
    this.documentFileName = obj && obj.documentFileName || null;
    this.displayName      = obj && obj.displayName      || null;
    this.documentType      = obj && obj.documentType      || null;
    this.datePosted      = obj && obj.datePosted      || null;
    this.documentFileSize      = obj && obj.documentFileSize      || null;
    this.internalURL      = obj && obj.internalURL      || null;
    this.isDeleted        = obj && obj.isDeleted        || null;
    this.internalMime     = obj && obj.internalMime     || null;

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
