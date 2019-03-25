import * as _ from 'lodash';
import { Document } from './document';

export class Decision {
  _id: string;
  _addedBy: string;
  _application: string; // objectid -> Application
  name: string;

  // associated data
  documents: Document[] = [];

  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._addedBy = (obj && obj._addedBy) || null;
    this._application = (obj && obj._application) || null;
    this.name = (obj && obj.name) || null;

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
