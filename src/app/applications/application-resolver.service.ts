import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApplicationService } from 'app/services/application.service';
import { Application } from 'app/models/application';

@Injectable()
export class ApplicationDetailResolver implements Resolve<Application> {

  constructor(
    private router: Router,
    private applicationService: ApplicationService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Application> {
    const appId = route.paramMap.get('appId');

    if (appId === '0') {
      // create new application
      const app = new Application({
        purpose: route.queryParamMap.get('purpose'),
        subpurpose: route.queryParamMap.get('subpurpose'),
        type: route.queryParamMap.get('type'),
        subtype: route.queryParamMap.get('subtype'),
        status: route.queryParamMap.get('status'),
        tenureStage: route.queryParamMap.get('tenureStage'),
        location: route.queryParamMap.get('location'),
        businessUnit: route.queryParamMap.get('businessUnit'),
        cl_file: +route.queryParamMap.get('cl_file'), // NB: unary operator
        tantalisID: +route.queryParamMap.get('tantalisID'), // NB: unary operator
      });

      // 7-digit CL File number for display
      if (app.cl_file) {
        app['clFile'] = app.cl_file.toString().padStart(7, '0');
      }

      return Observable.of(app);
    }

    // view/edit existing application
    // force-reload so we always have latest data
    return this.applicationService.getById(appId, true)
      .catch(error => {
        // if 403, redir to login page
        if (error && error.status === 403) { this.router.navigate(['/login']); }
        return Observable.of(null as Application);
      });
  }
}
