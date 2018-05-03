import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApiService } from './api';
import { DocumentService } from './document.service';
import { OrganizationService } from './organization.service';
import { CommentPeriodService } from './commentperiod.service';
import { CommentService } from './comment.service';
import { DecisionService } from './decision.service';
import { SearchService } from './search.service';

@Injectable()
export class ApplicationService {
  // statuses / query param options
  readonly ABANDONED = 'AB';
  readonly ACCEPTED = 'AC';
  readonly ALLOWED = 'AL';
  readonly CANCELLED = 'CA';
  readonly DISALLOWED = 'DI';
  readonly DISPOSITION_GOOD_STANDING = 'DG';
  readonly OFFER_ACCEPTED = 'OA';
  readonly OFFER_NOT_ACCEPTED = 'ON';
  readonly OFFERED = 'OF';
  readonly SUSPENDED = 'SU';
  // special combination status (see isDecision below)
  readonly DECISION_MADE = 'DE';
  // special status when no data
  readonly UNKNOWN = 'UN';

  public applicationStatuses: Array<string> = [];
  private application: Application = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private organizationService: OrganizationService,
    private commentPeriodService: CommentPeriodService,
    private commentService: CommentService,
    private decisionService: DecisionService,
    private searchService: SearchService
  ) {
    // display strings
    this.applicationStatuses[this.ABANDONED] = 'Application Abandoned';
    this.applicationStatuses[this.ACCEPTED] = 'Application Under Review';
    this.applicationStatuses[this.ALLOWED] = 'Decision: Allowed';
    this.applicationStatuses[this.CANCELLED] = 'Application Cancelled';
    this.applicationStatuses[this.DISALLOWED] = 'Decision: Not Approved';
    this.applicationStatuses[this.DISPOSITION_GOOD_STANDING] = 'Tenure: Disposition in Good Standing';
    this.applicationStatuses[this.OFFER_ACCEPTED] = 'Decision: Offer Accepted';
    this.applicationStatuses[this.OFFER_NOT_ACCEPTED] = 'Decision: Offer Not Accepted';
    this.applicationStatuses[this.OFFERED] = 'Decision: Offered';
    this.applicationStatuses[this.SUSPENDED] = 'Tenure: Suspended';
    this.applicationStatuses[this.DECISION_MADE] = 'Decision Made';
    this.applicationStatuses[this.UNKNOWN] = 'Unknown Application Status';
  }

  // get count of applications
  getCount(): Observable<number> {
    return this.getAllInternal()
      .map(applications => {
        return applications.length;
      });
  }

  // get all applications
  getAll(): Observable<Application[]> {
    // first get the applications
    return this.getAllInternal()
      .mergeMap(applications => {
        if (applications.length === 0) {
          return Observable.of([] as Application[]);
        }

        // replace \\n (JSON format) with newlines in each application
        applications.forEach((application, i) => {
          if (applications[i].description) {
            applications[i].description = applications[i].description.replace(/\\n/g, '\n');
          }
          if (applications[i].legalDescription) {
            applications[i].legalDescription = applications[i].legalDescription.replace(/\\n/g, '\n');
          }
        });

        const promises: Array<Promise<any>> = [];

        // now get the organization for each application
        // applications.forEach((application, i) => {
        //   if (applications[i]._organization) {
        //     promises.push(this.organizationService.getById(applications[i]._organization)
        //       .toPromise()
        //       .then(organization => application.organization = organization));
        //   }
        // });

        // now get the current comment period for each application
        applications.forEach((application, i) => {
          promises.push(this.commentPeriodService.getAllByApplicationId(applications[i]._id)
            .toPromise()
            .then(periods => {
              const cp = this.commentPeriodService.getCurrent(periods);
              applications[i].currentPeriod = cp;
              // derive comment period status for app list display + sorting
              applications[i]['cpStatus'] = this.commentPeriodService.getStatus(cp);
            })
          );
        });

        // now get the number of pending comments for each application
        applications.forEach((application, i) => {
          promises.push(this.commentService.getAllByApplicationId(applications[i]._id)
            .toPromise()
            .then(comments => {
              const pending = comments.filter(comment => this.commentService.isPending(comment));
              applications[i]['numComments'] = pending.length.toString();
            })
          );
        });

        // now get the referenced data (features)
        applications.forEach((application, i) => {
          promises.push(this.searchService.getByDTID(application.tantalisID)
            .toPromise()
            .then(features => {
              application.features = features;

              // calculate Total Area (hectares) from all features
              application.areaHectares = 0;
              _.each(application.features, function (f) {
                if (f['properties']) {
                  application.areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
                }
              });

              // cache application properties from first feature
              if (application.features && application.features.length > 0) {
                application.purpose = application.features[0].properties.TENURE_PURPOSE;
                application.subpurpose = application.features[0].properties.TENURE_SUBPURPOSE;
                application.type = application.features[0].properties.TENURE_TYPE;
                application.subtype = application.features[0].properties.TENURE_SUBTYPE;
                application.status = application.features[0].properties.TENURE_STATUS;
                application.tenureStage = application.features[0].properties.TENURE_STAGE;
                application.location = application.features[0].properties.TENURE_LOCATION;
                application.businessUnit = application.features[0].properties.RESPONSIBLE_BUSINESS_UNIT;
              }

              // derive application status for app list display + sorting
              application['appStatus'] = this.getStatus(application);
            })
          );
        });

        return Promise.all(promises).then(() => { return applications; });
      });
  }

  // get just the applications
  private getAllInternal(): Observable<Application[]> {
    return this.api.getApplications()
      .map(res => {
        const applications = res.text() ? res.json() : [];
        applications.forEach((application, i) => {
          applications[i] = new Application(application);
        });
        return applications;
      })
      .catch(this.api.handleError);
  }

  // get a specific application by its Tantalis ID
  // without related data
  getByTantalisId(tantalisId: number): Observable<Application> {
    return this.api.getApplicationByTantalisId(tantalisId)
      .map(res => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? new Application(applications[0]) : null;
      })
      .catch(this.api.handleError);
  }

  // get a specific application by its id
  getById(appId: string, forceReload: boolean = false): Observable<Application> {
    if (this.application && this.application._id === appId && !forceReload) {
      return Observable.of(this.application);
    }

    // first get the application data
    return this.api.getApplication(appId)
      .map(res => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? new Application(applications[0]) : null;
      })
      .mergeMap(application => {
        if (!application) { return Observable.of(null as Application); }

        // replace \\n (JSON format) with newlines
        if (application.description) {
          application.description = application.description.replace(/\\n/g, '\n');
        }
        if (application.legalDescription) {
          application.legalDescription = application.legalDescription.replace(/\\n/g, '\n');
        }

        const promises: Array<Promise<any>> = [];

        // now get the organization
        // if (application._organization) {
        //   promises.push(this.organizationService.getById(application._organization, forceReload)
        //     .toPromise()
        //     .then(organization => application.organization = organization)
        //   );
        // }

        // now get the documents
        promises.push(this.documentService.getAllByApplicationId(application._id)
          .toPromise()
          .then(documents => application.documents = documents)
        );

        // now get the current comment period
        promises.push(this.commentPeriodService.getAllByApplicationId(application._id)
          .toPromise()
          .then(periods => application.currentPeriod = this.commentPeriodService.getCurrent(periods))
        );

        // now get the decision
        promises.push(this.decisionService.getByApplicationId(application._id, forceReload)
          .toPromise()
          .then(decision => application.decision = decision)
        );

        // now get the referenced data (features)
        promises.push(this.searchService.getByDTID(application.tantalisID, forceReload)
          .toPromise()
          .then(features => {
            application.features = features;

            // calculate Total Area (hectares) from all features
            application.areaHectares = 0;
            _.each(application.features, function (f) {
              if (f['properties']) {
                application.areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
              }
            });

            // cache application properties from first feature
            if (application.features && application.features.length > 0) {
              application.purpose = application.features[0].properties.TENURE_PURPOSE;
              application.subpurpose = application.features[0].properties.TENURE_SUBPURPOSE;
              application.type = application.features[0].properties.TENURE_TYPE;
              application.subtype = application.features[0].properties.TENURE_SUBTYPE;
              application.status = application.features[0].properties.TENURE_STATUS;
              application.tenureStage = application.features[0].properties.TENURE_STAGE;
              application.location = application.features[0].properties.TENURE_LOCATION;
              application.businessUnit = application.features[0].properties.RESPONSIBLE_BUSINESS_UNIT;
            }
          })
        );

        return Promise.all(promises).then(() => {
          this.application = application;
          return this.application;
        });
      })
      .catch(this.api.handleError);
  }

  // create new application
  add(item: any): Observable<Application> {
    const app = new Application(item);

    // boilerplate for new application
    app.agency = 'Crown Land Allocation';
    app.name = 'New Application'; // TODO: remove if not needed
    app.region = 'Skeena';

    // id must not exist on POST
    delete app._id;

    // don't send features or documents
    delete app.features;
    delete app.documents;

    // replace newlines with \\n (JSON format)
    if (app.description) {
      app.description = app.description.replace(/\n/g, '\\n');
    }
    if (app.legalDescription) {
      app.legalDescription = app.legalDescription.replace(/\n/g, '\\n');
    }

    return this.api.addApplication(app)
      .map(res => {
        const application = res.text() ? res.json() : [];
        return new Application(application);
      })
      .catch(this.api.handleError);
  }

  save(orig: Application): Observable<Application> {
    // make a (deep) copy of the passed-in application so we don't change it
    const app = _.cloneDeep(orig);

    // don't send features or documents
    delete app.features;
    delete app.documents;

    // replace newlines with \\n (JSON format)
    if (app.description) {
      app.description = app.description.replace(/\n/g, '\\n');
    }
    if (app.legalDescription) {
      app.legalDescription = app.legalDescription.replace(/\n/g, '\\n');
    }

    console.log('app =>', app);
    return this.api.saveApplication(app)
      .map(res => {
        const a = res.text() ? res.json() : null;
        console.log('a =>', a);
        return a ? new Application(a) : null;
      })
      .catch(this.api.handleError);
  }

  delete(app: Application): Observable<Application> {
    return this.api.deleteApplication(app)
      .map(res => {
        const a = res.text() ? res.json() : null;
        return a ? new Application(a) : null;
      })
      .catch(this.api.handleError);
  }

  publish(app: Application): Observable<Application> {
    return this.api.publishApplication(app)
      .map(res => {
        const a = res.text() ? res.json() : null;
        return a ? new Application(a) : null;
      })
      .catch(this.api.handleError);
  }

  unPublish(app: Application): Observable<Application> {
    return this.api.unPublishApplication(app)
      .map(res => {
        const a = res.text() ? res.json() : null;
        return a ? new Application(a) : null;
      })
      .catch(this.api.handleError);
  }

  // returns application status based on status code
  getStatus(application: Application): string {
    if (!application || !application.status) {
      return null; // this.applicationStatuses[this.UNKNOWN]; // no data
    }

    switch (application.status.toUpperCase()) {
      case 'ABANDONED': return this.applicationStatuses[this.ABANDONED];
      case 'ACCEPTED': return this.applicationStatuses[this.ACCEPTED];
      case 'ALLOWED': return this.applicationStatuses[this.ALLOWED];
      case 'CANCELLED': return this.applicationStatuses[this.CANCELLED];
      case 'DISALLOWED': return this.applicationStatuses[this.DISALLOWED];
      case 'DISPOSITION IN GOOD STANDING': return this.applicationStatuses[this.DISPOSITION_GOOD_STANDING];
      case 'OFFER ACCEPTED': return this.applicationStatuses[this.OFFER_ACCEPTED];
      case 'OFFER NOT ACCEPTED': return this.applicationStatuses[this.OFFER_NOT_ACCEPTED];
      case 'OFFERED': return this.applicationStatuses[this.OFFERED];
      case 'SUSPENDED': return this.applicationStatuses[this.SUSPENDED];
    }

    // else return current status in title case
    return _.startCase(_.camelCase(application.status));
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
}
