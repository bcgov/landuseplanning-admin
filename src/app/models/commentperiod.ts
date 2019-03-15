import * as _ from 'lodash';

export class CommentPeriod {
  _id: string;
  _addedBy: string;
  _application: string;
  startDate: Date = null;
  endDate: Date = null;

  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._addedBy = (obj && obj._addedBy) || null;
    this._application = (obj && obj._application) || null;

    if (obj && obj.startDate) {
      this.startDate = new Date(obj.startDate);
    }

    if (obj && obj.endDate) {
      this.endDate = new Date(obj.endDate);
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
