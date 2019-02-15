import { Params } from '@angular/router';
import * as _ from 'lodash';

import { Project } from './project';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export class SearchResults {
  type: string;
  project: Project;

  constructor(search?: any, hostname?: any) {
    this.type          = search && search.type          || 0;
    this.project       = search && search.project       || 0;
  }
}

// export class SearchArray {
//   items: Array<SearchResults> = [];

//   constructor(obj?: any) {
//     // copy items
//     if (obj && obj.items) {
//       for (const item of obj.items) {
//         this.items.push(item);
//       }
//     }
//   }

//   sort() {
//     this.items.sort(function (a: SearchResults, b: SearchResults) {
//       const aDate = a && a.date ? new Date(a.date).getTime() : 0;
//       const bDate = b && b.date ? new Date(b.date).getTime() : 0;
//       return bDate - aDate;
//     });
//   }

//   get length(): number {
//     return this.items.length;
//   }

//   add(search?: SearchResults) {
//     if (search) {
//       this.items.push(search);
//     }
//   }
// }

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
