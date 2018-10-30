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
  description: string = null;
  internal: Internal;
  legalDescription: string = null;
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
  appStatus: string; // user-friendly application status
  cpStatus: string; // user-friendly comment period status

  isPublished = false; // depends on tags; see below

  // associated data
  documents: Array<Document> = [];
  currentPeriod: CommentPeriod = null;
  decision: Decision = null;
  features: Array<Feature> = [];

  constructor(obj?: any) {
    this._id                     = obj && obj._id           || null;

    this.agency        = obj && obj.agency        || null;
    this.areaHectares  = obj && obj.areaHectares  || null;
    this.businessUnit  = obj && obj.businessUnit  || null;
    this.cl_file       = obj && obj.cl_file       || null;
    this.client        = obj && obj.client        || null;
    this.location      = obj && obj.location      || null;
    this.name          = obj && obj.name          || null;
    this.publishDate   = obj && obj.publishDate   || null;
    this.purpose       = obj && obj.purpose       || null;
    this.status        = obj && obj.status        || null;
    this.subpurpose    = obj && obj.subpurpose    || null;
    this.subtype       = obj && obj.subtype       || null;
    this.tantalisID    = obj && obj.tantalisID    || null; // not zero
    this.tenureStage   = obj && obj.tenureStage   || null;
    this.type          = obj && obj.type          || null;

    this.region        = obj && obj.region        || null;
    this.appStatus     = obj && obj.appStatus     || null;
    this.cpStatus      = obj && obj.cpStatus      || null;

    this.currentPeriod = obj && obj.currentPeriod || null;
    this.decision      = obj && obj.decision      || null;

    this.internal      = new Internal(obj && obj.internal || null);

    // replace \\n (JSON format) with newlines
    if (obj && obj.description) {
      this.description = obj.description.replace(/\\n/g, '\n');
    }
    if (obj && obj.legalDescription) {
      this.legalDescription = obj.legalDescription.replace(/\\n/g, '\n');
    }

    // copy centroid
    if (obj && obj.centroid) {
      for (const num of obj.centroid) {
        this.centroid.push(num);
      }
    }

    // copy documents
    if (obj && obj.documents) {
      for (const doc of obj.documents) {
        this.documents.push(doc);
      }
    }

    // copy features
    if (obj && obj.features) {
      for (const feature of obj.features) {
        this.features.push(feature);
      }
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
