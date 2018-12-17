import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApplicationService } from 'app/services/application.service';
import { Application } from 'app/models/application';

import { of } from 'rxjs';

@Injectable()
export class ApplicationDetailResolver implements Resolve<Application> {

  constructor(
    private applicationService: ApplicationService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Application> {
    const appId = route.paramMap.get('appId');

    if (appId === '0') {
      // create new application
      const application = new Application({
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
        client: route.queryParamMap.get('client'),
        legalDescription: route.queryParamMap.get('legalDescription')
      });

      // 7-digit CL File number for display
      if (application.cl_file) {
        application['clFile'] = application.cl_file.toString().padStart(7, '0');
      }

      // user-friendly application status
      application.appStatus = this.applicationService.getStatusString(this.applicationService.getStatusCode(application.status));

      // derive region code
      application.region = this.applicationService.getRegionCode(application.businessUnit);

      return of(application);
    }

    // view/edit existing application
    return this.applicationService.getById(appId, { getFeatures: true, getDocuments: true, getCurrentPeriod: true, getDecision: true });
  }

}
