import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of, merge, forkJoin } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { ApplicationService } from 'app/services/application.service';
import { SearchResults } from 'app/models/search';
import { Client } from 'app/models/client';
import { Application } from 'app/models/application';
import { Feature } from 'app/models/feature';

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

        applications.forEach(app => {
          app['isCreated'] = true;
          results.push(app);
        });

        // now look at Tantalis results
        _.each(searchResults, result => {
          // Build the client string.
          let clientString = '';
          let idx = 0;
          for (let client of result.interestedParties) {
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
            purpose: result.TENURE_PURPOSE,
            subpurpose: result.TENURE_SUBPURPOSE,
            type: result.TENURE_TYPE,
            subtype: result.TENURE_SUBTYPE,
            status: result.TENURE_STATUS,
            tenureStage: result.TENURE_STAGE,
            location: result.TENURE_LOCATION,
            businessUnit: result.RESPONSIBLE_BUSINESS_UNIT,
            cl_file: +result.CROWN_LANDS_FILE,
            tantalisID: +result.DISPOSITION_TRANSACTION_SID,
            client: clientString
          });
          // 7-digit CL File number for display
          app['clFile'] = result.CROWN_LANDS_FILE.padStart(7, '0');
          // user-friendly application status
          app.appStatus = this.applicationService.getStatusString(this.applicationService.getStatusCode(result.TENURE_STATUS));
          // derive region code
          app.region = this.applicationService.getRegionCode(app.businessUnit);
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
        const searchResults: SearchResults = payloads[1];

        if (application) {
          application['isCreated'] = true;
          return [application];
        }

        // now look at Tantalis results
        const results: Array<Application> = [];
        if (searchResults != null) {

          // Build the client string.
          let clientString = '';
          let idx = 0;
          for (let client of searchResults.interestedParties) {
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
            purpose: searchResults.TENURE_PURPOSE,
            subpurpose: searchResults.TENURE_SUBPURPOSE,
            type: searchResults.TENURE_TYPE,
            subtype: searchResults.TENURE_SUBTYPE,
            status: searchResults.TENURE_STATUS,
            tenureStage: searchResults.TENURE_STAGE,
            location: searchResults.TENURE_LOCATION,
            businessUnit: searchResults.RESPONSIBLE_BUSINESS_UNIT,
            cl_file: +searchResults.CROWN_LANDS_FILE,
            tantalisID: +searchResults.DISPOSITION_TRANSACTION_SID,
            client: clientString
          });
          // 7-digit CL File number for display
          app['clFile'] = searchResults.CROWN_LANDS_FILE.padStart(7, '0');
          // user-friendly application status
          app.appStatus = this.applicationService.getStatusString(this.applicationService.getStatusCode(searchResults.TENURE_STATUS));
          // derive region code
          app.region = this.applicationService.getRegionCode(app.businessUnit);
          results.push(app);
        }

        return results;
      })
      .catch(error => this.api.handleError(error));
  }

}
