import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Proponent } from '../models/proponent';

@Injectable()
export class ProponentService {
  constructor(private api: ApiService) { }

  getAll() {
    return null;
    // // Get all organizations
    // return this.api.getProponents()
    //   .map((res: Response) => {
    //     const organizations = res.text() ? res.json() : [];

    //     organizations.forEach((org, index) => {
    //       organizations[index] = new Proponent(org);
    //     });

    //     return organizations;
    //   })
    //   .catch(this.api.handleError);
  }
}
