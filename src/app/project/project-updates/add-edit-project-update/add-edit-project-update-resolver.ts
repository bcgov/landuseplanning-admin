import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { RecentActivityService } from 'app/services/recent-activity';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class AddEditProjectUpdateResolver implements Resolve<Observable<object>> {
  constructor(
    private storageService: StorageService,
    private recentActivityService: RecentActivityService
  ) { }

  /**
   * Get route params and make a request to the API to get a single
   * project update(RecentActivity).
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const activityId = route.params.projectUpdateId;

    return this.recentActivityService.getById(activityId);
  }
}
