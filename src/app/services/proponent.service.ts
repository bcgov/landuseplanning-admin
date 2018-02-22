import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Proponent } from 'app/models/proponent';

@Injectable()
export class ProponentService {
  proponent: Proponent;

  constructor(private api: ApiService) { }

  // get all proponents
  getAll() {
    return this.api.getProponents()
      .map((res: Response) => {
        const proponents = res.text() ? res.json() : [];

        proponents.forEach((org, index) => {
          proponents[index] = new Proponent(org);
        });

        return proponents;
      })
      .catch(this.api.handleError);
  }

  // get a specific proponent by its id
  getById(id: string): Observable<Proponent> {
    return this.api.getProponent(id)
      .map((res: Response) => {
        const proponents = res.text() ? res.json() : [];
        // return just the first (only) proponent
        return proponents.length > 0 ? proponents[0] : null;
      })
      .map((proponent: Proponent) => {
        if (!proponent) { return; }

        this.proponent = proponent;

        return this.proponent;
      })
      .catch(this.api.handleError);
  }
}
