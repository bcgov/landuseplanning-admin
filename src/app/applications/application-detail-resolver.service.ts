import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApplicationService } from '../services/application.service';
import { Application } from '../models/application';

@Injectable()
export class ApplicationDetailResolver implements Resolve<Application> {
  constructor(private applicationService: ApplicationService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Application | Observable<Application> | Promise<Application> {
    const id = route.paramMap.get('id');
    return this.applicationService.getById(id)
      .catch(err => {
        return Observable.throw(err);
      });
  }
}
