import * as _ from 'lodash';

class Internal {
  notes: string;
  _addedBy: string;

  constructor(obj?: any) {
    this.notes    = obj && obj.notes    || null;
    this._addedBy = obj && obj._addedBy || null;
  }
}

export class CommentPeriod {
  _id: string;
  _addedBy: string;
  _application: string;
  description: string = null;
  code: string;
  startDate: Date;
  endDate: Date;
  internal: Internal; // OBSOLETE BUT API V1 EXPECTS IT - REMOVE LATER

  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._id          = obj && obj._id                 || null;
    this._addedBy     = obj && obj._addedBy            || null;
    this._application = obj && obj._application        || null;
    this.code         = obj && obj.code                || null;
    this.startDate    = obj && new Date(obj.startDate) || null;
    this.endDate      = obj && new Date(obj.endDate)   || null;

    this.internal = new Internal(obj && obj.internal || null);

    // replace \\n (JSON format) with newlines
    if (obj && obj.description) {
      this.description = obj.description.replace(/\\n/g, '\n');
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
