import { Injectable } from '@angular/core';
import { Observable, of, merge, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';

import { ApiService } from './api';
import { ApplicationService } from 'app/services/application.service';
import { SearchResults } from 'app/models/search';
import { Application } from 'app/models/application';

@Injectable()
export class SearchService {
  public isError = false;

  constructor(private api: ApiService, private applicationService: ApplicationService) {}

  // get search results by array of CLIDs or DTIDs
  getAppsByClidDtid(keys: string[]): Observable<Application[]> {
    this.isError = false;
    const observables = keys.map(clid => this.getAppsByCLID(clid)).concat(keys.map(dtid => this.getAppByDTID(+dtid)));
    return merge(...observables).pipe(catchError(error => this.api.handleError(error)));
  }

  // get search results by CL File #
  private getAppsByCLID(clid: string): Observable<Application[]> {
    const getByCrownLandID = this.applicationService.getByCrownLandID(clid, { getCurrentPeriod: true });

    const searchAppsByCLID = this.api.searchAppsByCLID(clid).pipe(
      catchError(() => {
        this.isError = true;
        // if search call fails, return null results
        return of(null as SearchResults[]);
      })
    );

    return forkJoin(getByCrownLandID, searchAppsByCLID).pipe(
      map(payloads => {
        const applications: Application[] = payloads[0];
        const searchResults: SearchResults[] = payloads[1];
        const results: Application[] = [];

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
          for (const client of searchResult.interestedParties) {
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
          if (
            app.statusHistoryEffectiveDate &&
            [
              this.applicationService.DECISION_APPROVED,
              this.applicationService.DECISION_NOT_APPROVED,
              this.applicationService.ABANDONED
            ].includes(appStatusCode)
          ) {
            app.retireDate = moment(app.statusHistoryEffectiveDate)
              .endOf('day')
              .add(6, 'months')
              .toDate();
            // set flag if retire date is in the past
            app.isRetired = moment(app.retireDate).isBefore();
          }

          results.push(app);
        });

        return results;
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  // get search results by Disposition Transaction ID
  private getAppByDTID(dtid: number): Observable<Application[]> {
    const getByTantalisID = this.applicationService.getByTantalisID(dtid, { getCurrentPeriod: true });

    const searchAppsByDTID = this.api.searchAppsByDTID(dtid).pipe(
      map(res => {
        return res ? new SearchResults(res) : null;
      }),
      catchError(() => {
        this.isError = true;
        // if call fails, return null results
        return of(null as SearchResults);
      })
    );

    return forkJoin(getByTantalisID, searchAppsByDTID).pipe(
      map(payloads => {
        const application: Application = payloads[0];
        const searchResult: SearchResults = payloads[1];

        // first look at PRC result
        if (application) {
          application['isCreated'] = true;
          // found a unique application in PRC -- no need to look at Tantalis results
          return [application];
        }

        // now look at Tantalis results
        const results: Application[] = [];
        if (searchResult != null) {
          // Build the client string.
          let clientString = '';
          let idx = 0;
          for (const client of searchResult.interestedParties) {
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
          if (
            app.statusHistoryEffectiveDate &&
            [
              this.applicationService.DECISION_APPROVED,
              this.applicationService.DECISION_NOT_APPROVED,
              this.applicationService.ABANDONED
            ].includes(appStatusCode)
          ) {
            app.retireDate = moment(app.statusHistoryEffectiveDate)
              .endOf('day')
              .add(6, 'months')
              .toDate();
            // set flag if retire date is in the past
            app.isRetired = moment(app.retireDate).isBefore();
          }

          results.push(app);
        }

        return results;
      }),
      catchError(error => this.api.handleError(error))
    );
  }
}
