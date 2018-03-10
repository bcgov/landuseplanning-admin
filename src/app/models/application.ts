import { Document } from './document';
import { Organization } from './organization';
import { CommentPeriod } from './commentperiod';
import { Decision } from './decision';
import { Feature } from './feature';
import * as _ from 'lodash';

export class Application {
  _id: string;
  id: string; // objectid

  _addedBy: string; // objectid -> User
  _updatedBy: string; // FUTURE
  dateAdded: Date;
  dateUpdated: Date;

  agency: string;
  areaHectares: number;
  businessUnit: string;
  cl_files: number[];
  code: string;
  name: string;
  description: string;
  interestID: number;
  internalID: number;
  legalDescription: string;
  location: string;
  latitude: number;
  longitude: number;
  mapsheet: string;
  postID: number;
  publishDate: Date;
  client: string;
  purpose: string;
  subpurpose: string;
  region: string;
  status: string;
  tenureStage: string;
  tantalisID: number;
  dispositionID: number;
  type: string;
  subtype: string;

  content: {
    type: string;
    page: string;
    html: string;
  }[];

  internal: {
    notes: string;
  };

  isPublished = false;

  documents: Array<Document>;
  organization: Organization;
  currentPeriod: CommentPeriod;
  decision: Decision;
  features: Feature[];

  constructor(obj?: any) {
    this._id                     = obj && obj._id                     || null;
    this.id                      = obj && obj.id                      || null;

    this._addedBy                = obj && obj._addedBy                || null;
    this._updatedBy              = obj && obj._updatedBy              || null;
    this.dateAdded               = obj && obj.dateAdded               || null;
    this.dateUpdated             = obj && obj.dateUpdated             || null;

    this.agency                  = obj && obj.agency                  || null;
    this.areaHectares            = obj && obj.areaHectares            || null;
    this.businessUnit            = obj && obj.businessUnit            || null;
    this.cl_files                = obj && obj.cl_files                || [];
    this.code                    = obj && obj.code                    || null;
    this.name                    = obj && obj.name                    || null;
    this.client                  = obj && obj.client                  || null;
    this.description             = obj && obj.description             || null;
    this.interestID              = obj && obj.interestID              || 0;
    this.internalID              = obj && obj.internalID              || 0;
    this.legalDescription        = obj && obj.legalDescription        || null;
    this.location                = obj && obj.location                || null;
    this.latitude                = obj && obj.latitude                || 0.00;
    this.longitude               = obj && obj.longitude               || 0.00;
    this.mapsheet                = obj && obj.mapsheet                || null;
    this.postID                  = obj && obj.postID                  || null;
    this.publishDate             = obj && obj.projectDate             || null; // TODO: change to publishDate
    this.purpose                 = obj && obj.purpose                 || null;
    this.subpurpose              = obj && obj.subpurpose              || null;
    this.region                  = obj && obj.region                  || null;
    this.status                  = obj && obj.status                  || null;
    this.tenureStage             = obj && obj.tenureStage             || null;
    this.tantalisID              = obj && obj.tantalisID              || 0;
    this.dispositionID           = obj && obj.dispositionID           || 0;
    this.type                    = obj && obj.type                    || null;
    this.subtype                 = obj && obj.subtype                 || null;

    this.content                 = obj && obj.content                 || [];
    this.internal                = obj && obj.internal                || null;

    // Wrap isPublished around the tags we receive for this object.
    if (obj && obj.tags) {
      const self = this;
      _.each(obj.tags, function (tag) {
        if (_.includes(tag, 'public')) {
          self.isPublished = true;
        }
      });
    }

    this.documents = [];
    this.organization = null;
    this.currentPeriod = null;
    this.decision = null;
    this.features = [];
  }

  getContent(page: string, type: string): string {
    try {
      const entry = this.content.find(x => x.type === type && x.page === page);
      return entry.html;
    } catch (e) {
      return '';
    }
  }
}
