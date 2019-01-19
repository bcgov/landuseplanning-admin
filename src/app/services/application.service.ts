import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { flatMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as moment from 'moment';
import * as _ from 'lodash';

import { ApiService } from './api';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { CommentService } from './comment.service';
import { DecisionService } from './decision.service';
import { FeatureService } from './feature.service';

import { Application } from 'app/models/application';
import { CommentPeriod } from 'app/models/commentperiod';

interface GetParameters {
  getFeatures?: boolean;
  getDocuments?: boolean;
  getCurrentPeriod?: boolean;
  getDecision?: boolean;
}

@Injectable()
export class ApplicationService {

  // statuses / query param options
  readonly ABANDONED = 'AB';
  readonly APPLICATION_UNDER_REVIEW = 'AUR';
  readonly APPLICATION_REVIEW_COMPLETE = 'ARC';
  readonly DECISION_APPROVED = 'DA';
  readonly DECISION_NOT_APPROVED = 'DNA';
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

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private commentService: CommentService,
    private decisionService: DecisionService,
    private featureService: FeatureService
  ) { }

  // get count of applications
  getCount(): Observable<number> {
    return this.api.getCountApplications()
      .catch(error => this.api.handleError(error));
  }

  // get all applications
  getAll(params: GetParameters = null): Observable<Application[]> {
    // first get just the applications
    // NB: max 1000 records
    return this.api.getApplications(0, 1000)
      .pipe(
        flatMap(apps => {
          if (!apps || apps.length === 0) {
            // NB: forkJoin([]) will complete immediately
            // so return empty observable instead
            return of([] as Application[]);
          }
          const observables: Array<Observable<Application>> = [];
          apps.forEach(app => {
            // now get the rest of the data for each application
            observables.push(this._getExtraAppData(new Application(app), params || {}));
          });
          return forkJoin(observables);
        })
      )
      .catch(error => this.api.handleError(error));
  }

  // get applications by their Crown Land ID
  getByCrownLandID(clid: string, params: GetParameters = null): Observable<Application[]> {
    // first get just the applications
    return this.api.getApplicationsByCrownLandID(clid)
      .pipe(
        flatMap(apps => {
          if (!apps || apps.length === 0) {
            // NB: forkJoin([]) will complete immediately
            // so return empty observable instead
            return of([] as Application[]);
          }
          const observables: Array<Observable<Application>> = [];
          apps.forEach(app => {
            // now get the rest of the data for each application
            observables.push(this._getExtraAppData(new Application(app), params || {}));
          });
          return forkJoin(observables);
        })
      )
      .catch(error => this.api.handleError(error));
  }

  // get a specific application by its Tantalis ID
  getByTantalisID(tantalisID: number, params: GetParameters = null): Observable<Application> {
    // first get just the application
    return this.api.getApplicationByTantalisId(tantalisID)
      .pipe(
        flatMap(apps => {
          if (!apps || apps.length === 0) {
            return of(null as Application);
          }
          // now get the rest of the data for this application
          return this._getExtraAppData(new Application(apps[0]), params || {});
        })
      )
      .catch(error => this.api.handleError(error));
  }

  // get a specific application by its object id
  getById(appId: string, params: GetParameters = null): Observable<Application> {
    // first get just the application
    return this.api.getApplication(appId)
      .pipe(
        flatMap(apps => {
          if (!apps || apps.length === 0) {
            return of(null as Application);
          }
          // now get the rest of the data for this application
          return this._getExtraAppData(new Application(apps[0]), params || {});
        })
      )
      .catch(error => this.api.handleError(error));
  }

  private _getExtraAppData(application: Application, { getFeatures = false, getDocuments = false, getCurrentPeriod = false, getDecision = false }: GetParameters): Observable<Application> {
    return forkJoin(
      getFeatures ? this.featureService.getByApplicationId(application._id) : of(null),
      getDocuments ? this.documentService.getAllByApplicationId(application._id) : of(null),
      getCurrentPeriod ? this.commentPeriodService.getAllByApplicationId(application._id) : of(null),
      getDecision ? this.decisionService.getByApplicationId(application._id, { getDocuments: true }) : of(null)
    )
      .map(payloads => {
        if (getFeatures) {
          application.features = payloads[0];
        }

        if (getDocuments) {
          application.documents = payloads[1];
        }

        if (getCurrentPeriod) {
          const periods: Array<CommentPeriod> = payloads[2];
          application.currentPeriod = this.commentPeriodService.getCurrent(periods);

          // user-friendly comment period status
          const cpStatusCode = this.commentPeriodService.getStatusCode(application.currentPeriod);
          application.cpStatus = this.commentPeriodService.getStatusString(cpStatusCode);

          // derive days remaining for display
          // use moment to handle Daylight Saving Time changes
          if (application.currentPeriod && this.commentPeriodService.isOpen(cpStatusCode)) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            application.currentPeriod['daysRemaining']
              = moment(application.currentPeriod.endDate).diff(moment(today), 'days') + 1; // including today
          }

          // get the number of comments for the current comment period only
          // multiple comment periods are currently not supported
          if (application.currentPeriod) {
            this.commentService.getCountByPeriodId(application.currentPeriod._id)
              .subscribe(
                numComments => {
                  application['numComments'] = numComments;
                }
              );
          }
        }

        if (getDecision) {
          application.decision = payloads[3];
        }

        // 7-digit CL File number for display
        if (application.cl_file) {
          application['clFile'] = application.cl_file.toString().padStart(7, '0');
        }

        // user-friendly application status
        application.appStatus = this.getLongStatusString(this.getStatusCode(application.status));

        // derive region code
        application.region = this.getRegionCode(application.businessUnit);

        // derive unique applicants
        if (application.client) {
          const clients = application.client.split(', ');
          application['applicants'] = _.uniq(clients).join(', ');
        }

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

    return this.api.addApplication(app)
      .catch(error => this.api.handleError(error));
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

    return this.api.saveApplication(app)
      .catch(error => this.api.handleError(error));
  }

  delete(app: Application): Observable<Application> {
    return this.api.deleteApplication(app)
      .catch(error => this.api.handleError(error));
  }

  publish(app: Application): Observable<Application> {
    return this.api.publishApplication(app)
      .catch(error => this.api.handleError(error));
  }

  unPublish(app: Application): Observable<Application> {
    return this.api.unPublishApplication(app)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Map Tantalis Status to status code.
   */
  getStatusCode(statusString: string): string {
    if (statusString) {
      switch (statusString.toUpperCase()) {
        case 'ABANDONED':
        case 'CANCELLED':
        case 'OFFER NOT ACCEPTED':
        case 'OFFER RESCINDED':
        case 'RETURNED':
        case 'REVERTED':
        case 'SOLD':
        case 'SUSPENDED':
        case 'WITHDRAWN':
          return this.ABANDONED;

        case 'ACCEPTED':
        case 'ALLOWED':
        case 'PENDING':
        case 'RECEIVED':
          return this.APPLICATION_UNDER_REVIEW;

        case 'OFFER ACCEPTED':
        case 'OFFERED':
          return this.APPLICATION_REVIEW_COMPLETE;

        case 'ACTIVE':
        case 'COMPLETED':
        case 'DISPOSITION IN GOOD STANDING':
        case 'EXPIRED':
        case 'HISTORIC':
          return this.DECISION_APPROVED;

        case 'DISALLOWED':
          return this.DECISION_NOT_APPROVED;

        case 'NOT USED':
        case 'PRE-TANTALIS':
          return this.UNKNOWN;
      }
    }
    return this.UNKNOWN;
  }

  /**
   * Map status code to Tantalis Status(es).
   */
  getTantalisStatus(statusCode: string): Array<string> {
    if (statusCode) {
      switch (statusCode.toUpperCase()) {
        case this.ABANDONED: return ['ABANDONED', 'CANCELLED', 'OFFER NOT ACCEPTED', 'OFFER RESCINDED', 'RETURNED', 'REVERTED', 'SOLD', 'SUSPENDED', 'WITHDRAWN'];
        case this.APPLICATION_UNDER_REVIEW: return ['ACCEPTED', 'ALLOWED', 'PENDING', 'RECEIVED'];
        case this.APPLICATION_REVIEW_COMPLETE: return ['OFFER ACCEPTED', 'OFFERED'];
        case this.DECISION_APPROVED: return ['ACTIVE', 'COMPLETED', 'DISPOSITION IN GOOD STANDING', 'EXPIRED', 'HISTORIC'];
        case this.DECISION_NOT_APPROVED: return ['DISALLOWED'];
        case this.UNKNOWN: return null;
      }
    }
    return null;
  }

  /**
   * Given a status code, returns a short user-friendly status string.
   */
  getShortStatusString(statusCode: string): string {
    if (statusCode) {
      switch (statusCode) {
        case this.ABANDONED: return 'Abandoned';
        case this.APPLICATION_UNDER_REVIEW: return 'Under Review';
        case this.APPLICATION_REVIEW_COMPLETE: return 'Decision Pending';
        case this.DECISION_APPROVED: return 'Approved';
        case this.DECISION_NOT_APPROVED: return 'Not Approved';
        case this.UNKNOWN: return 'Unknown';
      }
    }
    return null;
  }

  /**
   * Given a status code, returns a long user-friendly status string.
   */
  getLongStatusString(statusCode: string): string {
    if (statusCode) {
      switch (statusCode) {
        case this.ABANDONED: return 'Abandoned';
        case this.APPLICATION_UNDER_REVIEW: return 'Application Under Review';
        case this.APPLICATION_REVIEW_COMPLETE: return 'Application Review Complete - Decision Pending';
        case this.DECISION_APPROVED: return 'Decision: Approved - Tenure Issued';
        case this.DECISION_NOT_APPROVED: return 'Decision: Not Approved';
        case this.UNKNOWN: return 'Unknown Status';
      }
    }
    return null;
  }

  isAbandoned(statusCode: string): boolean {
    return (statusCode === this.ABANDONED);
  }

  isApplicationUnderReview(statusCode: string): boolean {
    return (statusCode === this.APPLICATION_UNDER_REVIEW);
  }

  isApplicationReviewComplete(statusCode: string): boolean {
    return (statusCode === this.APPLICATION_REVIEW_COMPLETE);
  }

  isDecisionApproved(statusCode: string): boolean {
    return (statusCode === this.DECISION_APPROVED);
  }

  isDecisionNotApproved(statusCode: string): boolean {
    return (statusCode === this.DECISION_NOT_APPROVED);
  }

  isUnknown(statusCode: string): boolean {
    return (statusCode === this.UNKNOWN);
  }

  /**
   * Returns region code.
   */
  getRegionCode(businessUnit: string): string {
    return businessUnit && businessUnit.toUpperCase().split(' ')[0];
  }

  /**
   * Given a region code, returns a user-friendly region string.
   */
  getRegionString(regionCode: string): string {
    if (regionCode) {
      switch (regionCode) {
        case this.CARIBOO: return 'Cariboo, Williams Lake';
        case this.KOOTENAY: return 'Kootenay, Cranbrook';
        case this.LOWER_MAINLAND: return 'Lower Mainland, Surrey';
        case this.OMENICA: return 'Omenica/Peace, Prince George';
        case this.PEACE: return 'Peace, Ft. St. John';
        case this.SKEENA: return 'Skeena, Smithers';
        case this.SOUTHERN_INTERIOR: return 'Thompson Okanagan, Kamloops';
        case this.VANCOUVER_ISLAND: return 'West Coast, Nanaimo';
      }
    }
    return null;
  }

}
