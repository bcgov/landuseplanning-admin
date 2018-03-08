import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { ApplicationService } from 'app/services/application.service';
import { Application } from 'app/models/application';

@Injectable()
export class ApplicationListResolver implements Resolve<any> {

  constructor(private applicationService: ApplicationService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Application[] | ErrorObservable> {
    return this.applicationService.getAll()
      .catch(err => { return Observable.of(null); });
  }
}

@Injectable()
export class ApplicationDetailResolver implements Resolve<Application> {

  constructor(private applicationService: ApplicationService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Application> | ErrorObservable {
    const appId = route.paramMap.get('appId');
    return this.applicationService.getById(appId)
      .catch(err => { return Observable.of(null); });
  }
}
