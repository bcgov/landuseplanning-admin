export class CommentPeriod {
  _id: string;
  addedBy: string;
  application: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  internalNotes: string;

  constructor(obj?: any) {
    this._id            = obj && obj._id            || null;
    this.addedBy        = obj && obj.addedBy        || null;
    this.application    = obj && obj.application    || null;
    this.name           = obj && obj.name           || null;
    this.startDate      = obj && obj.startDate      || null;
    this.endDate        = obj && obj.endDate        || null;
    this.description    = obj && obj.description    || null;
    this.internalNotes  = obj && obj.internalNotes  || null;
  }
}
