import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as moment from 'moment';

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
        legalDescription: route.queryParamMap.get('legalDescription'),
        client: route.queryParamMap.get('client'),
        statusHistoryEffectiveDate: route.queryParamMap.get('statusHistoryEffectiveDate')
      });

      // 7-digit CL File number for display
      if (application.cl_file) {
        application['clFile'] = application.cl_file.toString().padStart(7, '0');
      }

      // user-friendly application status
      const appStatusCode = this.applicationService.getStatusCode(application.status);
      application.appStatus = this.applicationService.getLongStatusString(appStatusCode);

      // derive region code
      application.region = this.applicationService.getRegionCode(application.businessUnit);

      // derive unique applicants
      if (application.client) {
        const clients = application.client.split(', ');
        application['applicants'] = _.uniq(clients).join(', ');
      }

      // derive date of removal from ACRFD
      if (application.statusHistoryEffectiveDate && [this.applicationService.DECISION_APPROVED, this.applicationService.DECISION_NOT_APPROVED, this.applicationService.ABANDONED].includes(appStatusCode)) {
        application['removeDate'] = moment(application.statusHistoryEffectiveDate).add(6, 'months');
      }

      return of(application);
    }

    // view/edit existing application
    return this.applicationService.getById(appId, { getFeatures: true, getDocuments: true, getCurrentPeriod: true, getDecision: true });
  }

}
