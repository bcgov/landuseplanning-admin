import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { RecentActivity } from 'app/models/recentActivity';

@Injectable()
export class RecentActivityService {

  constructor(private api: ApiService) { }

  // getByTantalisId(tantalisId: number): Observable<RecentActivity[]> {
  //   return this.api.getRecentActivitysByTantalisId(tantalisId)
  //     .map(res => {
  //       if (res && res.length > 0) {
  //         const features: Array<RecentActivity> = [];
  //         res.forEach(f => {
  //           features.push(new RecentActivity(f));
  //         });
  //         return features;
  //       }
  //       return [];
  //     })
  //     .catch(error => this.api.handleError(error));
  // }

  // getByProjectId(projectId: string): Observable<RecentActivity[]> {
  //   return this.api.getRecentActivitysByProjectId(projectId)
  //     .map(res => {
  //       if (res && res.length > 0) {
  //         const features: Array<RecentActivity> = [];
  //         res.forEach(f => {
  //           features.push(new RecentActivity(f));
  //         });
  //         return features;
  //       }
  //       return [];
  //     })
  //     .catch(error => this.api.handleError(error));
  // }

  // deleteByApplicationId(applicationId: string): Observable<Object> {
  //   return this.api.deleteRecentActivitysByApplicationId(applicationId)
  //     .catch(error => this.api.handleError(error));
  // }

  // MBL TODO: PUT/POST functionality.
  add(activity: RecentActivity) {
    return this.api.addRecentActivity(activity)
    .map(res => {
      if (res) {
        return new RecentActivity(res);
      }
      return [];
    })
    .catch(error => this.api.handleError(error));
  }

  // TODO: publish/unpublish functionality

}
