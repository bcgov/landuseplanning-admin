import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Feature } from 'app/models/feature';

@Injectable()
export class FeatureService {

  constructor(private api: ApiService) { }

  getByDTID(tantalisId: number): Observable<Feature[]> {
    return this.api.getFeaturesByTantalisId(tantalisId)
      .map(res => {
        const feature = res.text() ? res.json() : [];
        feature.forEach((feature, index) => {
          feature[index] = new Feature(feature);
        });
        return feature;
      })
      .catch(this.api.handleError);
  }

  getByApplicationId(applicationId: string): Observable<Feature[]> {
    return this.api.getFeaturesByApplicationId(applicationId)
      .map(res => {
        const feature = res.text() ? res.json() : [];
        feature.forEach((feature, index) => {
          feature[index] = new Feature(feature);
        });
        return feature;
      })
      .catch(this.api.handleError);
  }

  // MBL TODO: PUT/POST/DELETE functionality.
}
