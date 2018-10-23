import { Injectable } from '@angular/core';
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
      .catch(this.api.handleError);
  }

  getByApplicationId(applicationId: string): Observable<Feature[]> {
    return this.api.getFeaturesByApplicationId(applicationId)
      .catch(this.api.handleError);
  }

  deleteByApplicationId(applicationId: string): Observable<Object> {
    return this.api.deleteFeaturesByApplicationId(applicationId)
      .catch(this.api.handleError);
  }

  // MBL TODO: PUT/POST functionality.

  // TODO: publish/unpublish functionality

}
