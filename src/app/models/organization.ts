export class Organization {
  _id: string;
  _addedBy: string;
  code: string;
  name: string;

  constructor(obj?: any) {
    this._id      = obj && obj._id      || null;
    this._addedBy = obj && obj._addedBy || null;
    this.code     = obj && obj.code     || null;
    this.name     = obj && obj.name     || null;
  }
}
