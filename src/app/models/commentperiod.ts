import * as _ from 'lodash';

class Internal {
  notes: string;
  _addedBy: string;
}

export class CommentPeriod {
  _id: string;
  _addedBy: string;
  _application: string;
  description: string;
  code: string;
  startDate: Date;
  endDate: Date;
  internal: Internal; // OBSOLETE BUT API V1 EXPECTS IT - REMOVE LATER

  isPublished = false;

  constructor(obj?: any) {
    this._id          = obj && obj._id                 || null;
    this._addedBy     = obj && obj._addedBy            || null;
    this._application = obj && obj._application        || null;
    this.code         = obj && obj.code                || null;
    this.startDate    = obj && new Date(obj.startDate) || null;
    this.endDate      = obj && new Date(obj.endDate)   || null;
    this.internal     = obj && obj.internal            || new Internal();

    // Wrap isPublished around the tags we receive for this object.
    if (obj && obj.tags) {
      const self = this;
      _.each(obj.tags, function (tag) {
        if (_.includes(tag, 'public')) {
          self.isPublished = true;
        }
      });
    }

    if (obj && obj.description) {
      this.description = obj.description.replace(/\\n/g, '\n');
    }
  }
}
