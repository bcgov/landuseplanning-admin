import { Document } from './document';
import { CommentPeriod } from './commentperiod';
import { Decision } from './decision';
import { Feature } from './feature';
import * as _ from 'lodash';

class Internal {
  notes: string;

  constructor(obj?: any) {
    this.notes = obj && obj.notes || null;
  }
}

export class Application {
  _id: string;

  // the following are retrieved from the API
  agency: string;
  areaHectares: number;
  businessUnit: string;
  centroid: Array<number> = []; // [lng, lat]
  cl_file: number;
  client: string;
  description: string;
  internal: Internal;
  legalDescription: string;
  location: string;
  name: string; // MAY BE OBSOLETE
  publishDate: Date;
  purpose: string;
  status: string;
  subpurpose: string;
  subtype: string;
  tantalisID: number;
  tenureStage: string;
  type: string;

  region: string; // region code derived from Business Unit

  isPublished = false; // depends on tags; see below

  // associated data
  documents: Array<Document> = [];
  currentPeriod: CommentPeriod = null;
  decision: Decision = null;
  features: Array<Feature> = [];

  constructor(obj?: any) {
    this._id                     = obj && obj._id                     || null;

    this.agency                  = obj && obj.agency                  || null;
    this.areaHectares            = obj && obj.areaHectares            || null;
    this.businessUnit            = obj && obj.businessUnit            || null;
    this.cl_file                 = obj && obj.cl_file                 || null;
    this.client                  = obj && obj.client                  || null;
    this.description             = obj && obj.description             || null;
    this.internal                = obj && obj.internal                || new Internal(obj.internal);
    this.legalDescription        = obj && obj.legalDescription        || null;
    this.location                = obj && obj.location                || null;
    this.name                    = obj && obj.name                    || null;
    this.publishDate             = obj && obj.publishDate             || null;
    this.purpose                 = obj && obj.purpose                 || null;
    this.status                  = obj && obj.status                  || null;
    this.subpurpose              = obj && obj.subpurpose              || null;
    this.subtype                 = obj && obj.subtype                 || null;
    this.tantalisID              = obj && obj.tantalisID              || null; // not zero
    this.tenureStage             = obj && obj.tenureStage             || null;
    this.type                    = obj && obj.type                    || null;

    this.region                  = obj && obj.region                  || null;

    if (obj && obj.centroid) {
      obj.centroid.forEach(num => {
        this.centroid.push(num);
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
