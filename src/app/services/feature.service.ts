import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Feature } from 'app/models/feature';

@Injectable()
export class FeatureService {

  constructor(private api: ApiService) { }

  getByTantalisId(tantalisId: number): Observable<Feature[]> {
    return this.api.getFeaturesByTantalisId(tantalisId)
      .pipe(
        map(res => {
          if (res && res.length > 0) {
            const features: Array<Feature> = [];
            res.forEach(f => {
              features.push(new Feature(f));
            });
            return features;
          }
          return [];
        }),
        catchError(error => this.api.handleError(error))
      );
  }

  getByApplicationId(applicationId: string): Observable<Feature[]> {
    return this.api.getFeaturesByApplicationId(applicationId)
      .pipe(
        map(res => {
          if (res && res.length > 0) {
            const features: Array<Feature> = [];
            res.forEach(f => {
              features.push(new Feature(f));
            });
            return features;
          }
          return [];
        }),
        catchError(error => this.api.handleError(error))
      );
  }

  deleteByApplicationId(applicationId: string): Observable<Object> {
    return this.api.deleteFeaturesByApplicationId(applicationId)
      .pipe(
        catchError(error => this.api.handleError(error))
      );
  }

  // MBL TODO: PUT/POST functionality.

  // TODO: publish/unpublish functionality

}
