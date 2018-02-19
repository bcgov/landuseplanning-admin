import * as _ from 'lodash';
import { CollectionsList } from './collection';

export class Application {
  _id: string;
  _schemaName: string;
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
  isPublished: boolean;
  legalDescription: string;
  location: string;
  latitude: number;
  longitude: number;
  mapsheet: string;
  postID: number;
  projectDate: Date;
  _proponent: string; // objectid -> Organization
  purpose: string;
  subpurpose: string;
  region: string;
  status: string;
  tantalisID: number;
  type: string;
  subtype: string;

  collections: CollectionsList; // used for documents

  internal: {
    notes: string;
  };

  content: {
    type: string;
    page: string;
    html: string;
  }[];

  // client: string;

  constructor(obj?: any) {
    this._id                     = obj && obj._id                     || null;
    this._schemaName             = obj && obj._schemaName             || null;
    this.id                      = obj && obj.id                      || null;

    this._addedBy                = obj && obj._addedBy                || null;
    this._updatedBy              = obj && obj._updatedBy              || null;
    this.dateAdded               = obj && obj.dateAdded               || null;
    this.dateUpdated             = obj && obj.dateUpdated             || null;

    this.agency                  = obj && obj.agency                  || null;
    this.areaHectares            = obj && obj.areaHectares            || null;
    this.businessUnit            = obj && obj.businessUnit            || null;
    this.cl_files                = obj && obj.cl_file                 || null;
    this.code                    = obj && obj.code                    || null;
    this.name                    = obj && obj.name                    || null;
    this.description             = obj && obj.description             || null;
    this.interestID              = obj && obj.interestID              || 0;
    this.internalID              = obj && obj.internalID              || 0;
    this.legalDescription        = obj && obj.legalDescription        || null;
    this.location                = obj && obj.location                || null;
    this.latitude                = obj && obj.lat                     || 0;
    this.longitude               = obj && obj.lon                     || 0;
    this.mapsheet                = obj && obj.mapsheet                || null;
    this.postID                  = obj && obj.postID                  || null;
    this.projectDate             = obj && obj.projectDate             || null;
    this._proponent              = obj && obj._proponent              || null;
    this.purpose                 = obj && obj.purpose                 || null;
    this.subpurpose              = obj && obj.subpurpose              || null;
    this.region                  = obj && obj.region                  || null;
    this.status                  = obj && obj.status                  || null;
    this.tantalisID              = obj && obj.tantalisID              || 0;
    this.type                    = obj && obj.type                    || null;
    this.subtype                 = obj && obj.subtype                 || null;

    this.collections             = obj && obj.collections             || null;
    this.content                 = obj && obj.content                 || [];
    this.internal                = obj && obj.internal                || null;

    const self = this;

    if (obj && obj.tags) {
      // Wrap isPublished around the tags we receive for this object.
      _.each(obj.tags, function (tag) {
        if (_.includes(tag, 'public')) {
          self.isPublished = true;
        }
      });
    }
    // get the client from the proponent
    // this.client = (obj && obj.proponent && obj.proponent.name) ? obj.proponent.name : 'unknown';
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
