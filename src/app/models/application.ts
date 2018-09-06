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

  agency: string;
  cl_file: number;
  client: string;
  code: string;
  description: string;
  id: string; // objectid (same as _id)
  internal: Internal;
  internalID: number;
  latitude: number;
  legalDescription: string;
  longitude: number;
  name: string;
  postID: number;
  publishDate: Date;
  region: string;
  tantalisID: number;

  // the following are cached from features[0].properties
  businessUnit: string;
  location: string;
  purpose: string;
  subpurpose: string;
  status: string;
  tenureStage: string;
  type: string;
  subtype: string;

  areaHectares: number; // calculated from all features

  isPublished = false; // depends on tags; see below

  // associated data
  documents: Array<Document> = [];
  currentPeriod: CommentPeriod = null;
  decision: Decision = null;
  features: Array<Feature> = [];

  constructor(obj?: any) {
    this._id                     = obj && obj._id                     || null;

    this.agency                  = obj && obj.agency                  || null;
    this.cl_file                 = obj && obj.cl_file                 || null;
    this.client                  = obj && obj.client                  || null;
    this.code                    = obj && obj.code                    || null;
    this.description             = obj && obj.description             || null;
    this.id                      = obj && obj.id                      || null;
    this.internal                = obj && obj.internal                || new Internal(obj.internal);
    this.internalID              = obj && obj.internalID              || 0;
    this.latitude                = obj && obj.latitude                || 0.00;
    this.legalDescription        = obj && obj.legalDescription        || null;
    this.longitude               = obj && obj.longitude               || 0.00;
    this.name                    = obj && obj.name                    || null;
    this.postID                  = obj && obj.postID                  || null;
    this.publishDate             = obj && obj.publishDate             || null;
    this.region                  = obj && obj.region                  || null;
    this.tantalisID              = obj && obj.tantalisID              || null; // not zero

    this.businessUnit            = obj && obj.businessUnit            || null;
    this.location                = obj && obj.location                || null;
    this.purpose                 = obj && obj.purpose                 || null;
    this.subpurpose              = obj && obj.subpurpose              || null;
    this.status                  = obj && obj.status                  || null;
    this.tenureStage             = obj && obj.tenureStage             || null;
    this.type                    = obj && obj.type                    || null;
    this.subtype                 = obj && obj.subtype                 || null;

    this.areaHectares            = obj && obj.areaHectares            || null;

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
