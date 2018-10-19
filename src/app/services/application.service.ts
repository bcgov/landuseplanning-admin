import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, flatMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import 'rxjs/add/operator/catch';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApiService } from './api';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { CommentService } from './comment.service';
import { DecisionService } from './decision.service';
import { FeatureService } from './feature.service';
import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';

interface GetParameters {
  getFeatures?: boolean;
  getDocuments?: boolean;
  getCurrentPeriod?: boolean;
  getNumComments?: boolean;
  getDecision?: boolean;
}

@Injectable()
export class ApplicationService {
  // statuses / query param options
  readonly ABANDONED = 'AB';
  readonly ACCEPTED = 'AC';
  readonly ALLOWED = 'AL';
  readonly CANCELLED = 'CA';
  readonly DECISION_MADE = 'DE'; // special combination status (see isDecision below)
  readonly DISALLOWED = 'DI';
  readonly DISPOSITION_GOOD_STANDING = 'DG';
  readonly OFFER_ACCEPTED = 'OA';
  readonly OFFER_NOT_ACCEPTED = 'ON';
  readonly OFFERED = 'OF';
  readonly SUSPENDED = 'SU';
  readonly UNKNOWN = 'UN'; // special status when no data

  // regions / query param options
  readonly CARIBOO = 'CA';
  readonly KOOTENAY = 'KO';
  readonly LOWER_MAINLAND = 'LM';
  readonly OMENICA = 'OM';
  readonly PEACE = 'PE';
  readonly SKEENA = 'SK';
  readonly SOUTHERN_INTERIOR = 'SI';
  readonly VANCOUVER_ISLAND = 'VI';

  // use helpers to get these:
  private applicationStatuses: Array<string> = [];
  private regions: Array<string> = [];

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private commentService: CommentService,
    private decisionService: DecisionService,
    private featureService: FeatureService
  ) {
    // user-friendly strings for display
    this.applicationStatuses[this.ABANDONED] = 'Application Abandoned';
    this.applicationStatuses[this.ACCEPTED] = 'Application Under Review';
    this.applicationStatuses[this.ALLOWED] = 'Decision: Allowed';
    this.applicationStatuses[this.CANCELLED] = 'Application Cancelled';
    this.applicationStatuses[this.DECISION_MADE] = 'Decision Made';
    this.applicationStatuses[this.DISALLOWED] = 'Decision: Not Approved';
    this.applicationStatuses[this.DISPOSITION_GOOD_STANDING] = 'Tenure: Disposition in Good Standing';
    this.applicationStatuses[this.OFFER_ACCEPTED] = 'Decision: Offer Accepted';
    this.applicationStatuses[this.OFFER_NOT_ACCEPTED] = 'Decision: Offer Not Accepted';
    this.applicationStatuses[this.OFFERED] = 'Decision: Offered';
    this.applicationStatuses[this.SUSPENDED] = 'Tenure: Suspended';
    this.applicationStatuses[this.UNKNOWN] = 'Unknown Application Status';

    this.regions[this.CARIBOO] = 'Cariboo, Williams Lake';
    this.regions[this.KOOTENAY] = 'Kootenay, Cranbrook';
    this.regions[this.LOWER_MAINLAND] = 'Lower Mainland, Surrey';
    this.regions[this.OMENICA] = 'Omenica/Peace, Prince George';
    this.regions[this.PEACE] = 'Peace, Ft. St. John';
    this.regions[this.SKEENA] = 'Skeena, Smithers';
    this.regions[this.SOUTHERN_INTERIOR] = 'Thompson Okanagan, Kamloops';
    this.regions[this.VANCOUVER_ISLAND] = 'West Coast, Nanaimo';
  }

  // get count of applications
  getCount(): Observable<number> {
    // get just the applications, and count them
    return this.api.getApplications()
      .map(applications => {
        return applications.length;
      })
      .catch(this.api.handleError);
  }

  // get all applications
  getAll(params: GetParameters = null): Observable<Application[]> {
    // first get just the applications
    // then get the rest of the application data
    return this.api.getApplications()
      .pipe(
        flatMap(value => {
          const observables: Array<Observable<Application>> = [];
          value.forEach(v => {
            observables.push(this._getExtraAppData(new Application(v), params || {}));
          });
          return forkJoin(observables);
        })
      )
      .catch(this.api.handleError);
  }

  // get a specific application by its Tantalis ID
  getByTantalisID(tantalisID: number, params: GetParameters = null): Observable<Application> {
    // first get the base application data
    // then get the rest of the application data
    return this.api.getApplicationByTantalisID(tantalisID)
      .pipe(
        flatMap(value => {
          return this._getExtraAppData(new Application(value[0]), params || {})
        })
      )
      .catch(this.api.handleError);
  }

  // get a specific application by its object id
  getById(appId: string, params: GetParameters = null): Observable<Application> {
    // first get the base application data
    // then get the rest of the application data
    return this.api.getApplication(appId)
      .pipe(
        flatMap(value => {
          return this._getExtraAppData(new Application(value[0]), params || {})
        })
      )
      .catch(this.api.handleError);
  }

  private _getExtraAppData(application: Application, { getFeatures = false, getDocuments = false, getCurrentPeriod = false, getNumComments = false, getDecision = false }: GetParameters): Observable<Application> {
    return forkJoin(
      getFeatures ? this.featureService.getByApplicationId(application._id) : of(null),
      getDocuments ? this.documentService.getAllByApplicationId(application._id) : of(null),
      getCurrentPeriod ? this.commentPeriodService.getAllByApplicationId(application._id) : of(null),
      getNumComments ? this.commentService.getCountByApplicationId(application._id) : of(null),
      getDecision ? this.decisionService.getByApplicationId(application._id) : of(null)
    )
      .map(payloads => {
        if (getFeatures) {
          application.features = payloads[0];
          _.each(application.features, function (f) {
            if (f['properties']) {
              application.areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
            }
          });
        }

        if (getDocuments) {
          _.each(payloads[1], function (d) {
            const newDoc = new Document(d);
            application.documents.push(newDoc);
          });
        }

        if (getCurrentPeriod) {
          const periods = [];
          _.each(payloads[2], function (p) {
            periods.push(new CommentPeriod(p));
          });
          const cp = this.commentPeriodService.getCurrent(periods);
          application.currentPeriod = cp;
          // user-friendly comment period status
          application.cpStatus = this.commentPeriodService.getStatus(cp);

          // derive days remaining for display
          // use moment to handle Daylight Saving Time changes
          if (cp && this.commentPeriodService.isOpen(cp)) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            application.currentPeriod['daysRemaining'] = moment(cp.endDate).diff(moment(today), 'days') + 1; // including today
          }
        }

        if (getNumComments) {
          const numComments = payloads[3];
          application['numComments'] = numComments.toString();
        }

        if (getDecision) {
          const decision = payloads[4];
          application.decision = decision;
        }

        // 7-digit CL File number for display
        if (application.cl_file) {
          application['clFile'] = application.cl_file.toString().padStart(7, '0');
        }

        // user-friendly application status
        application.appStatus = this.getStatusString(this.getStatusCode(application.status));

        // derive region code
        application.region = this.getRegionCode(application.businessUnit);

        // finally update the object and return
        return application;
      });
  }

  // create new application
  add(item: any): Observable<Application> {
    const app = new Application(item);

    // boilerplate for new application
    app.agency = 'Crown Land Allocation';
    app.name = item.cl_file && item.cl_file.toString();

    // id must not exist on POST
    delete app._id;

    // don't send attached data (features, documents, etc)
    delete app.features;
    delete app.documents;
    delete app.currentPeriod;
    delete app.decision;

    // replace newlines with \\n (JSON format)
    if (app.description) {
      app.description = app.description.replace(/\n/g, '\\n');
    }
    if (app.legalDescription) {
      app.legalDescription = app.legalDescription.replace(/\n/g, '\\n');
    }

    return this.api.addApplication(app);
  }

  // update existing application
  save(orig: Application): Observable<Application> {
    // make a (deep) copy of the passed-in application so we don't change it
    const app = _.cloneDeep(orig);

    // don't send attached data (features, documents, etc)
    delete app.features;
    delete app.documents;
    delete app.currentPeriod;
    delete app.decision;

    // replace newlines with \\n (JSON format)
    if (app.description) {
      app.description = app.description.replace(/\n/g, '\\n');
    }
    if (app.legalDescription) {
      app.legalDescription = app.legalDescription.replace(/\n/g, '\\n');
    }

    return this.api.saveApplication(app);
  }

  delete(app: Application): Observable<Application> {
    return this.api.deleteApplication(app);
  }

  publish(app: Application): Observable<Application> {
    return this.api.publishApplication(app);
  }

  unPublish(app: Application): Observable<Application> {
    return this.api.unPublishApplication(app);
  }

  /**
   * Returns status abbreviation.
   */
  getStatusCode(status: string): string {
    if (status) {
      switch (status.toUpperCase()) {
        case 'ABANDONED': return this.ABANDONED;
        case 'ACCEPTED': return this.ACCEPTED;
        case 'ALLOWED': return this.ALLOWED;
        case 'CANCELLED': return this.CANCELLED;
        case 'DISALLOWED': return this.DISALLOWED;
        case 'DISPOSITION IN GOOD STANDING': return this.DISPOSITION_GOOD_STANDING;
        case 'OFFER ACCEPTED': return this.OFFER_ACCEPTED;
        case 'OFFER NOT ACCEPTED': return this.OFFER_NOT_ACCEPTED;
        case 'OFFERED': return this.OFFERED;
        case 'SUSPENDED': return this.SUSPENDED;
      }
      // else return given status in title case
      return _.startCase(_.camelCase(status));
    }
    return this.UNKNOWN; // no data
  }

  /**
   * Returns user-friendly status string.
   */
  getStatusString(status: string): string {
    if (status) {
      switch (status.toUpperCase()) {
        case this.ABANDONED: return this.applicationStatuses[this.ABANDONED];
        case this.ACCEPTED: return this.applicationStatuses[this.ACCEPTED];
        case this.ALLOWED: return this.applicationStatuses[this.ALLOWED];
        case this.CANCELLED: return this.applicationStatuses[this.CANCELLED];
        case this.DECISION_MADE: return this.applicationStatuses[this.DECISION_MADE]; // NB: calculated status
        case this.DISALLOWED: return this.applicationStatuses[this.DISALLOWED];
        case this.DISPOSITION_GOOD_STANDING: return this.applicationStatuses[this.DISPOSITION_GOOD_STANDING];
        case this.OFFER_ACCEPTED: return this.applicationStatuses[this.OFFER_ACCEPTED];
        case this.OFFER_NOT_ACCEPTED: return this.applicationStatuses[this.OFFER_NOT_ACCEPTED];
        case this.OFFERED: return this.applicationStatuses[this.OFFERED];
        case this.SUSPENDED: return this.applicationStatuses[this.SUSPENDED];
        case this.UNKNOWN: return this.applicationStatuses[this.UNKNOWN];
      }
      return status; // not one of the above, but return it anyway
    }
    return null;
  }

  isAccepted(status: string): boolean {
    return (status && status.toUpperCase() === 'ACCEPTED');
  }

  // NOTE: a decision may or may not include Cancelled
  // see code that uses this helper
  isDecision(status: string): boolean {
    const s = (status && status.toUpperCase());
    return (s === 'ALLOWED'
      || s === 'CANCELLED'
      || s === 'DISALLOWED'
      || s === 'OFFER ACCEPTED'
      || s === 'OFFER NOT ACCEPTED'
      || s === 'OFFERED');
  }

  isCancelled(status: string): boolean {
    return (status && status.toUpperCase() === 'CANCELLED');
  }

  isAbandoned(status: string): boolean {
    return (status && status.toUpperCase() === 'ABANDONED');
  }

  isDispGoodStanding(status: string): boolean {
    return (status && status.toUpperCase() === 'DISPOSITION IN GOOD STANDING');
  }

  isSuspended(status: string): boolean {
    return (status && status.toUpperCase() === 'SUSPENDED');
  }

  /**
   * Returns region abbreviation.
   */
  getRegionCode(businessUnit: string): string {
    if (businessUnit) {
      return businessUnit.toUpperCase().split(' ')[0];
    }
    return null;
  }

  /**
   * Returns user-friendly region string.
   */
  getRegionString(abbrev: string): string {
    return this.regions[abbrev]; // returns null if not found
  }
}
