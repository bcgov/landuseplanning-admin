import * as _ from 'lodash';
import { Document } from './document';

export class Decision {
  _id: string;
  _addedBy: string;
  _application: string; // objectid -> Application
  code: string;
  name: string;
  description: string = null;

  documents: Array<Document> = [];
  isPublished = false;

  constructor(obj?: any) {
    this._id          = obj && obj._id          || null;
    this._addedBy     = obj && obj._addedBy     || null;
    this._application = obj && obj._application || null;
    this.code         = obj && obj.code         || null;
    this.name         = obj && obj.name         || null;

    // replace \\n (JSON format) with newlines
    if (obj && obj.description) {
      this.description = obj.description.replace(/\\n/g, '\n');
    }

    // copy documents
    if (obj && obj.documents) {
      obj.documents.forEach(doc => {
        this.documents.push(doc);
      });
    }

    // wrap isPublished around the tags we receive for this object
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
