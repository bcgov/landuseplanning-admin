import { Params } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import { Feature } from './feature';
import { InterestedParty } from './interestedParty';

export class SearchResults {
  _id: string;
  totalFeatures: number;
  date: Date = null;
  crs: string;
  type: string;
  status: string;
  hostname: string;

  features: Array<Feature> = [];
  sidsFound: Array<string> = [];

  // New Data
  CROWN_LANDS_FILE: string;
  DISPOSITION_TRANSACTION_SID: string;
  RESPONSIBLE_BUSINESS_UNIT: string;
  TENURE_LOCATION: string;
  TENURE_PURPOSE: string;
  TENURE_STAGE: string;
  TENURE_STATUS: string;
  TENURE_SUBPURPOSE: string;
  TENURE_SUBTYPE: string;
  TENURE_TYPE: string;
  areaHectares: number;
  centroid: Array<number> = [];
  interestedParties: Array<InterestedParty> = [];
  parcels: Array<Feature> = [];

  constructor(search?: any, hostname?: any) {
    this._id           = search && search._id           || null;
    this.totalFeatures = search && search.totalFeatures || 0;
    this.crs           = search && search.crs           || null;
    this.type          = search && search.type          || null;
    this.status        = search && search.status        || null;
    this.hostname      = hostname;

    this.CROWN_LANDS_FILE             = search && search.CROWN_LANDS_FILE || null;
    this.DISPOSITION_TRANSACTION_SID  = search && search.DISPOSITION_TRANSACTION_SID || null;
    this.RESPONSIBLE_BUSINESS_UNIT    = search && search.RESPONSIBLE_BUSINESS_UNIT || null;
    this.TENURE_LOCATION              = search && search.TENURE_LOCATION || null;
    this.TENURE_PURPOSE               = search && search.TENURE_PURPOSE || null;
    this.TENURE_STAGE                 = search && search.TENURE_STAGE || null;
    this.TENURE_STATUS                = search && search.TENURE_STATUS || null;
    this.TENURE_SUBPURPOSE            = search && search.TENURE_SUBPURPOSE || null;
    this.TENURE_SUBTYPE               = search && search.TENURE_SUBTYPE || null;
    this.TENURE_TYPE                  = search && search.TENURE_TYPE || null;
    this.TENURE_TYPE                  = search && search.TENURE_TYPE || null;
    this.areaHectares                 = search && search.areaHectares || null;
    this.centroid                     = search && search.centroid || null;
    this.parcels                      = search && search.parcels || null;

    if (search && search.date) {
      this.date = new Date(search.date);
    }

    // copy features
    if (search && search.features) {
      for (const feature of search.features) {
        this.features.push(feature);
      }
    }

    // copy interestedParties
    if (search && search.interestedParties) {
      for (const party of search.interestedParties) {
        this.interestedParties.push(party);
      }
    }

    // copy sidsFound
    if (search && search.sidsFound) {
      for (const sid of search.sidsFound) {
        this.sidsFound.push(sid);
      }
    }
  }
}

export class SearchArray {
  items: Array<SearchResults> = [];

  constructor(obj?: any) {
    // copy items
    if (obj && obj.items) {
      for (const item of obj.items) {
        this.items.push(item);
      }
    }
  }

  sort() {
    this.items.sort(function (a: SearchResults, b: SearchResults) {
      const aDate = a && a.date ? new Date(a.date).getTime() : 0;
      const bDate = b && b.date ? new Date(b.date).getTime() : 0;
      return bDate - aDate;
    });
  }

  get length(): number {
    return this.items.length;
  }

  add(search?: SearchResults) {
    if (search) {
      this.items.push(search);
    }
  }
}

export class SearchTerms {
  keywords: string; // comma- or space-delimited list
  dateStart: NgbDateStruct;
  dateEnd: NgbDateStruct;

  constructor(obj?: any) {
    this.keywords  = obj && obj.keywords  || null;
    this.dateStart = obj && obj.dateStart || null;
    this.dateEnd   = obj && obj.dateEnd   || null;
  }

  getParams(): Params {
    const params = {};

    if (this.keywords) {
      // tokenize by comma, space, etc and remove duplicate items
      const keywords = _.uniq(this.keywords.match(/\b(\w+)/g));
      params['keywords'] = keywords.join(',');
    }
    if (this.dateStart) {
      params['datestart'] = this.getDateParam(this.dateStart);
    }
    if (this.dateEnd) {
      params['dateend'] = this.getDateParam(this.dateEnd);
    }

    return params;
  }

  private getDateParam(date: NgbDateStruct): string {
    let dateParam = date.year + '-';

    if (date.month < 10) {
      dateParam += '0';
    }
    dateParam += date.month + '-';

    if (date.day < 10) {
      dateParam += '0';
    }
    dateParam += date.day;

    return dateParam;
  }
}
