import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of, merge, forkJoin } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';
import * as moment from 'moment';

import { ApiService } from './api';
import { ApplicationService } from 'app/services/application.service';
import { SearchResults } from 'app/models/search';
import { Application } from 'app/models/application';

@Injectable()
export class SearchService {

  public isError = false;

  constructor(
    private api: ApiService,
    private applicationService: ApplicationService
  ) { }

  // get search results by array of CLIDs or DTIDs
  getAppsByClidDtid(keys: string[]): Observable<Array<Application>> {
    this.isError = false;
    const observables = keys.map(clid => { return this.getAppsByCLID(clid); })
      .concat(keys.map(dtid => { return this.getAppByDTID(+dtid); }));
    return merge(...observables)
      .catch(error => this.api.handleError(error));
  }

  // get search results by CL File #
  private getAppsByCLID(clid: string): Observable<Array<Application>> {
    const getByCrownLandID = this.applicationService.getByCrownLandID(clid, { getCurrentPeriod: true });

    const searchAppsByCLID = this.api.searchAppsByCLID(clid)
      .catch(() => {
        this.isError = true;
        // if search call fails, return null results
        return of(null as SearchResults[]);
      });

    return forkJoin(getByCrownLandID, searchAppsByCLID)
      .map(payloads => {
        const applications: Array<Application> = payloads[0];
        const searchResults: Array<SearchResults> = payloads[1];
        const results: Array<Application> = [];

        // first look at PRC results
        applications.forEach(app => {
          app['isCreated'] = true;
          results.push(app);
        });

        // now look at Tantalis results
        _.each(searchResults, searchResult => {
          // Build the client string.
          let clientString = '';
          let idx = 0;
          for (let client of searchResult.interestedParties) {
            if (idx > 0) {
              clientString += ', ';
            }
            idx++;
            if (client.interestedPartyType === 'O') {
              clientString += client.legalName;
            } else {
              clientString += client.firstName + ' ' + client.lastName;
            }
          }

          const app = new Application({
            purpose: searchResult.TENURE_PURPOSE,
            subpurpose: searchResult.TENURE_SUBPURPOSE,
            type: searchResult.TENURE_TYPE,
            subtype: searchResult.TENURE_SUBTYPE,
            status: searchResult.TENURE_STATUS,
            tenureStage: searchResult.TENURE_STAGE,
            location: searchResult.TENURE_LOCATION,
            businessUnit: searchResult.RESPONSIBLE_BUSINESS_UNIT,
            cl_file: +searchResult.CROWN_LANDS_FILE,
            tantalisID: +searchResult.DISPOSITION_TRANSACTION_SID,
            client: clientString,
            statusHistoryEffectiveDate: searchResult.statusHistoryEffectiveDate
          });

          // 7-digit CL File number for display
          app.clFile = searchResult.CROWN_LANDS_FILE.padStart(7, '0');

          // user-friendly application status
          const appStatusCode = this.applicationService.getStatusCode(searchResult.TENURE_STATUS);
          app.appStatus = this.applicationService.getLongStatusString(appStatusCode);

          // derive region code
          app.region = this.applicationService.getRegionCode(app.businessUnit);

          // derive unique applicants
          if (app.client) {
            const clients = app.client.split(', ');
            app.applicants = _.uniq(clients).join(', ');
          }

          // derive retire date
          if (app.statusHistoryEffectiveDate && [this.applicationService.DECISION_APPROVED, this.applicationService.DECISION_NOT_APPROVED, this.applicationService.ABANDONED].includes(appStatusCode)) {
            app.retireDate = moment(app.statusHistoryEffectiveDate).endOf('day').add(6, 'months').toDate();
            // set flag if retire date is in the past
            app.isRetired = moment(app.retireDate).isBefore();
          }

          results.push(app);
        });

        return results;
      })
      .catch(error => this.api.handleError(error));
  }

  // get search results by Disposition Transaction ID
  private getAppByDTID(dtid: number): Observable<Array<Application>> {
    const getByTantalisID = this.applicationService.getByTantalisID(dtid, { getCurrentPeriod: true });

    const searchAppsByDTID = this.api.searchAppsByDTID(dtid)
      .map(res => {
        return res ? new SearchResults(res) : null;
      })
      .catch(() => {
        this.isError = true;
        // if call fails, return null results
        return of(null as SearchResults);
      });

    return forkJoin(getByTantalisID, searchAppsByDTID)
      .map(payloads => {
        const application: Application = payloads[0];
        const searchResult: SearchResults = payloads[1];

        // first look at PRC result
        if (application) {
          application['isCreated'] = true;
          // found a unique application in PRC -- no need to look at Tantalis results
          return [application];
        }

        // now look at Tantalis results
        const results: Array<Application> = [];
        if (searchResult != null) {

          // Build the client string.
          let clientString = '';
          let idx = 0;
          for (let client of searchResult.interestedParties) {
            if (idx > 0) {
              clientString += ', ';
            }
            idx++;
            if (client.interestedPartyType === 'O') {
              clientString += client.legalName;
            } else {
              clientString += client.firstName + ' ' + client.lastName;
            }
          }

          const app = new Application({
            purpose: searchResult.TENURE_PURPOSE,
            subpurpose: searchResult.TENURE_SUBPURPOSE,
            type: searchResult.TENURE_TYPE,
            subtype: searchResult.TENURE_SUBTYPE,
            status: searchResult.TENURE_STATUS,
            tenureStage: searchResult.TENURE_STAGE,
            location: searchResult.TENURE_LOCATION,
            businessUnit: searchResult.RESPONSIBLE_BUSINESS_UNIT,
            cl_file: +searchResult.CROWN_LANDS_FILE,
            tantalisID: +searchResult.DISPOSITION_TRANSACTION_SID,
            client: clientString,
            statusHistoryEffectiveDate: searchResult.statusHistoryEffectiveDate
          });

          // 7-digit CL File number for display
          app.clFile = searchResult.CROWN_LANDS_FILE.padStart(7, '0');

          // user-friendly application status
          const appStatusCode = this.applicationService.getStatusCode(searchResult.TENURE_STATUS);
          app.appStatus = this.applicationService.getLongStatusString(appStatusCode);

          // derive region code
          app.region = this.applicationService.getRegionCode(app.businessUnit);

          // derive unique applicants
          if (app.client) {
            const clients = app.client.split(', ');
            app.applicants = _.uniq(clients).join(', ');
          }

          // derive retire date
          if (app.statusHistoryEffectiveDate && [this.applicationService.DECISION_APPROVED, this.applicationService.DECISION_NOT_APPROVED, this.applicationService.ABANDONED].includes(appStatusCode)) {
            app.retireDate = moment(app.statusHistoryEffectiveDate).endOf('day').add(6, 'months').toDate();
            // set flag if retire date is in the past
            app.isRetired = moment(app.retireDate).isBefore();
          }

          results.push(app);
        }

        return results;
      })
      .catch(error => this.api.handleError(error));
  }

}
