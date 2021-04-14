import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { RecentActivityService } from 'app/services/recent-activity';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class AddEditProjectUpdateResolver implements Resolve<Observable<object>> {
  constructor(
    private storageService: StorageService,
    private recentActivityService: RecentActivityService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const activityId = route.params.projectUpdateId;

    return this.recentActivityService.getById(activityId);
  }
}
