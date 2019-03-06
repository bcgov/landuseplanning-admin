import * as _ from 'lodash';

export class Topic {
  _id: string;
  name: string;
  description: string;
  type: string;
  pillar: string;

  documents: Array<Document> = [];

  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._id         = obj && obj._id         || null;
    this.name        = obj && obj.name        || null;
    this.description = obj && obj.description || null;
    this.type        = obj && obj.type        || 0;
    this.pillar      = obj && obj.pillar      || null;
  }
}
