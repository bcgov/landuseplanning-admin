import { Project } from './project';
import { Proponent } from './proponent';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export class Search {
  _id: string;
  totalFeatures: number;
  features: {
    id: string;
  }[];
  date: Date;
  crs: string;
  type: string;
  status: string;
  hostname: string;
  project: Project;

  constructor(search?: any, hostname?: any) {
    this._id         = search && search._id         || null;
    this.totalFeatures = search && search.totalFeatures || null;
    this.crs  = search && search.crs  || null;
    this.type        = search && search.type        || null;
    this.date        = search && search.date        || null;
    this.status      = search && search.status      || null;
    this.project     = search && search.project     || null;
    this.hostname    = hostname;

    this.features = [];
    if (search && search.features) {
      search.features.forEach(feature => {
        this.features.push(feature);
      });
    }
  }
}

export class SearchArray {
  items: Search[];

  constructor(obj?: any) {
    this.items = obj && obj.items || [];
  }

  sort() {
    this.items.sort(function(a: Search, b: Search) {
      const aDate = a && a.date ? new Date(a.date).getTime() : 0;
      const bDate = b && b.date ? new Date(b.date).getTime() : 0;
      return bDate - aDate;
    });
  }

  get length() {
    return this.items.length;
  }

  add(search?: Search) {
    if (search) {
      this.items.push(search);
    }
  }
}

export class SearchTerms {
  keywords: string;
  clfiles: string;
  projects: Array<Project>;
  proponents: Array<Proponent>;
  ownerships: Array<Proponent>;
  dateStart: NgbDateStruct;
  dateEnd: NgbDateStruct;

  constructor() {
    this.keywords   = '';
    this.clfiles     = '';
    this.projects   = [];
    this.proponents = [];
    this.ownerships = [];
    this.dateStart  = null;
    this.dateEnd    = null;
  }

  getParams() {
    const params = {};

    if (this.keywords) {
      params['keywords'] = this.keywords.split(' ').join(',');
    }

    if (this.clfiles) {
      params['clfiles'] = this.clfiles.split(' ').join(',');
    }

    if (this.projects.length) {
      params['projects'] = this.projects.map(p => p._id).join(',');
    }

    if (this.proponents.length) {
      params['proponents'] = this.proponents.map(p => p._id).join(',');
    }

    if (this.ownerships.length) {
      params['ownerships'] = this.ownerships.map(o => o._id).join(',');
    }

    if (this.dateStart) {
      params['datestart'] = this.getDateParam(this.dateStart);
    }

    if (this.dateEnd) {
      params['dateend'] = this.getDateParam(this.dateEnd);
    }

    return params;
  }

  private getDateParam(date: NgbDateStruct) {
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
