import * as _ from 'lodash';

export class Document {
  _id: string;
  _application: string; // objectid -> Application
  _comment: string; // objectid -> Comment
  _decision: string; // objectid -> Decision
  documentFileName: string;
  displayName: string;
  internalURL: string;
  internalMime: string;

  // are the following obsolete?
  keywords: string[];
  directoryID: number;
  application: string;
  description: string;
  dateReceived: string;
  documentDate: string;
  datePosted: string;
  dateUploaded: string;
  dateUpdated: string;
  dateAdded: string;

  isPublished = false;

  constructor(obj?: any) {
    this._id              = obj && obj._id              || null;
    this._application     = obj && obj._application     || null;
    this._comment         = obj && obj._comment         || null;
    this._decision        = obj && obj._decision        || null;
    this.documentFileName = obj && obj.documentFileName || null;
    this.displayName      = obj && obj.displayName      || null;
    this.internalURL      = obj && obj.internalURL      || null;
    this.internalMime     = obj && obj.internalMime     || null;

    this.keywords         = obj && obj.keywords         || [];
    this.directoryID      = obj && obj.directoryID      || null;
    this.application      = obj && obj.application      || null;
    this.description      = obj && obj.description      || null;
    this.dateReceived     = obj && obj.dateReceived     || null;
    this.documentDate     = obj && obj.documentDate     || null;
    this.datePosted       = obj && obj.datePosted       || null;
    this.dateUploaded     = obj && obj.dateUploaded     || null;
    this.dateUpdated      = obj && obj.dateUpdated      || null;
    this.dateAdded        = obj && obj.dateAdded        || null;

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
