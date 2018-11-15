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

  public isBcgwError = false;

  constructor(
    private api: ApiService,
    private applicationService: ApplicationService
  ) { }

  // get clients by Disposition Transaction ID
  getClientsByDTID(dtid: number): Observable<Client[]> {
    this.isBcgwError = false;
    return this.api.searchClientsByDTID(dtid)
      .map(res => {
        if (res && res.length > 0) {
          const clients: Array<Client> = [];
          res.forEach(c => {
            clients.push(new Client(c));
          });
          return clients;
        }
        return [];
      })
      .catch(error => {
        this.isBcgwError = true;
        return this.api.handleError(error);
      });
  }

  // get search results by array of CLIDs or DTIDs
  getAppsByClidDtid(keys: string[]): Observable<Array<Application>> {
    this.isBcgwError = false;
    const observables = keys.map(clid => { return this.getAppsByCLID(clid); })
      .concat(keys.map(dtid => { return this.getAppByDTID(+dtid); }));
    return merge(...observables)
      .catch(error => this.api.handleError(error));
  }

  // get search results by CL File #
  private getAppsByCLID(clid: string): Observable<Array<Application>> {
    const getByCrownLandID = this.applicationService.getByCrownLandID(clid, { getCurrentPeriod: true });

    const searchAppsByCLID = this.api.searchAppsByCLID(clid)
      .map(res => {
        return res ? new SearchResults(res) : null;
      })
      .catch(() => {
        this.isBcgwError = true;
        // if search call fails, return null results
        return of(null as SearchResults);
      });

    return forkJoin(getByCrownLandID, searchAppsByCLID)
      .map(payloads => {
        const applications: Array<Application> = payloads[0];
        const searchResults: SearchResults = payloads[1];
        const results: Array<Application> = [];

        // first look at PRC results
        applications.forEach(app => {
          app['isCreated'] = true;
          results.push(app);
        });

        // now look at BCGW results
        if (searchResults && searchResults.totalFeatures > 0 && searchResults.features && searchResults.features.length > 0) {
          const groupedFeatures = _.groupBy(searchResults.features, 'properties.DISPOSITION_TRANSACTION_SID');
          _.each(groupedFeatures, (value: any, key: string) => {
            const feature = new Feature(value[0]);
            // add BCGW result if not already found in PRC
            if (!_.find(results, app => { return app.tantalisID === feature.properties.DISPOSITION_TRANSACTION_SID; })) {
              const app = new Application({
                purpose: feature.properties.TENURE_PURPOSE,
                subpurpose: feature.properties.TENURE_SUBPURPOSE,
                type: feature.properties.TENURE_TYPE,
                subtype: feature.properties.TENURE_SUBTYPE,
                status: feature.properties.TENURE_STATUS,
                tenureStage: feature.properties.TENURE_STAGE,
                location: feature.properties.TENURE_LOCATION,
                businessUnit: feature.properties.RESPONSIBLE_BUSINESS_UNIT,
                cl_file: feature.properties.CROWN_LANDS_FILE,
                tantalisID: feature.properties.DISPOSITION_TRANSACTION_SID,
                legalDescription: feature.properties.TENURE_LEGAL_DESCRIPTION
              });
              // 7-digit CL File number for display
              app['clFile'] = feature.properties.CROWN_LANDS_FILE.padStart(7, '0');
              // user-friendly application status
              app.appStatus = this.applicationService.getStatusString(this.applicationService.getStatusCode(feature.properties.TENURE_STATUS));
              // derive region code
              app.region = this.applicationService.getRegionCode(app.businessUnit);
              results.push(app);
            }
          });
        }

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
        this.isBcgwError = true;
        // if call fails, return null results
        return of(null as SearchResults);
      });

    return forkJoin(getByTantalisID, searchAppsByDTID)
      .map(payloads => {
        const application: Application = payloads[0];
        const searchResults: SearchResults = payloads[1];

        // first look at PRC result
        if (application) {
          application['isCreated'] = true;
          // found a unique application in PRC -- no need to look at BCGW results
          return [application];
        }

        // now look at BCGW results
        const results: Array<Application> = [];
        if (searchResults && searchResults.totalFeatures > 0 && searchResults.features && searchResults.features.length > 0) {
          const groupedFeatures = _.groupBy(searchResults.features, 'properties.DISPOSITION_TRANSACTION_SID');
          _.each(groupedFeatures, (value: any, key: string) => {
            const feature = new Feature(value[0]);
            const app = new Application({
              purpose: feature.properties.TENURE_PURPOSE,
              subpurpose: feature.properties.TENURE_SUBPURPOSE,
              type: feature.properties.TENURE_TYPE,
              subtype: feature.properties.TENURE_SUBTYPE,
              status: feature.properties.TENURE_STATUS,
              tenureStage: feature.properties.TENURE_STAGE,
              location: feature.properties.TENURE_LOCATION,
              businessUnit: feature.properties.RESPONSIBLE_BUSINESS_UNIT,
              cl_file: feature.properties.CROWN_LANDS_FILE,
              tantalisID: feature.properties.DISPOSITION_TRANSACTION_SID,
              legalDescription: feature.properties.TENURE_LEGAL_DESCRIPTION
            });
            // 7-digit CL File number for display
            app['clFile'] = feature.properties.CROWN_LANDS_FILE.padStart(7, '0');
            // user-friendly application status
            app.appStatus = this.applicationService.getStatusString(this.applicationService.getStatusCode(feature.properties.TENURE_STATUS));
            // derive region code
            app.region = this.applicationService.getRegionCode(app.businessUnit);
            results.push(app);
          });
        }

        return results;
      })
      .catch(error => this.api.handleError(error));
  }

}
