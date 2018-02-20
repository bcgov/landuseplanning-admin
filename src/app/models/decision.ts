import { Document } from 'app/models/document';

export class Decision {
    _id: string;
    _addedBy: string; // objectid -> User
    _application: string; // objectid -> Application
    code: string;
    name: string;
    decisionDate: Date;
    description: string;
    _documents: string[]; // list of object ids -> Document

    documents: Array<Document>;

    constructor(obj?: any) {
      this._id          = obj && obj._id          || null;
      this._addedBy     = obj && obj._addedBy     || null;
      this._application = obj && obj._application || null;
      this.code         = obj && obj.code         || null;
      this.name         = obj && obj.name         || null;
      this.decisionDate = obj && obj.decisionDate || null;
      this.description  = obj && obj.description  || null;
      this._documents   = obj && obj._documents   || [];

      this.documents = [];
  }
}
