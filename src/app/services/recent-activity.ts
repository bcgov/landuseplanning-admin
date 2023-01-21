import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { RecentActivity } from 'app/models/recentActivity';

@Injectable()
export class RecentActivityService {

  constructor(private api: ApiService) { }

  /**
   * Get a recetn activity by its ID.
   *
   * @param {string} activityId The recent activity ID to get by.
   * @returns {Observable}
   */
  getById(activityId: string) {
    return this.api.getRecentActivity(activityId)
    .map(res => {
      if (res && res.length > 0) {
        return new RecentActivity(res[0]);
      }
      return [];
    })
    .catch(error => this.api.handleError(error));
  }

  /**
   * Add a new recent activity.
   *
   * @param {RecentActivity} activity The recent activity to add.
   * @returns {Observable}
   */
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

  /**
   * Save a recent activity object.
   *
   * @param {RecentActivity} activity The recent activity to save.
   * @returns {Observable}
   */
  save(activity: RecentActivity) {
    return this.api.saveRecentActivity(activity)
    .map(res => {
      if (res) {
        return new RecentActivity(res);
      }
      return [];
    })
    .catch(error => this.api.handleError(error));
  }

  /**
   * Delete a recent activity.
   *
   * @param {RecentActivity} activity The recent activity to delete.
   * @returns {Observable}
   */
  delete(activity: RecentActivity) {
    return this.api.deleteRecentActivity(activity)
    .map(res => {
      if (res) {
        return new RecentActivity(res);
      }
      return [];
    })
    .catch(error => this.api.handleError(error));
  }
}
