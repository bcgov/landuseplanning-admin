export class CommentPeriod {
  _id: string;
  _addedBy: string;
  _application: string;
  code: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  internal: {
    notes: string;
    _addedBy: string;
  };
  isDeleted: boolean;

  constructor(obj?: any) {
    this._id          = obj && obj._id          || null;
    this._addedBy     = obj && obj._addedBy     || null;
    this._application = obj && obj._application || null;
    this.code         = obj && obj.code         || null;
    this.name         = obj && obj.name         || null;
    this.startDate    = obj && obj.startDate    || null;
    this.endDate      = obj && obj.endDate      || null;
    this.description  = obj && obj.description  || null;
    this.internal     = obj && obj.internal     || null;
    this.isDeleted    = obj && obj.isDeleted    || false;
  }
}
