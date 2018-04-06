import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
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
import { DecisionService } from './decision.service';
import { SearchService } from './search.service';

@Injectable()
export class ApplicationService {
  private application: Application = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private organizationService: OrganizationService,
    private commentPeriodService: CommentPeriodService,
    private decisionService: DecisionService,
    private searchService: SearchService
  ) { }

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
          // derive application status for app list display + sorting
          applications[i]['appStatus'] = this.getStatus(applications[i]);
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

        // now get the features/shapes
        promises.push(this.searchService.getByDTID(application.tantalisID, forceReload)
          .toPromise()
          .then(features => {
            application.features = features;

            // calculate Total Area (hectares)
            let areaHectares = 0;
            _.each(application.features, function (f) {
              if (f['properties']) {
                areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
              }
            });
            application.areaHectares = areaHectares;

            // update application properties from first feature
            if (application.features && application.features.length > 0) {
              application.purpose = application.features[0].properties.TENURE_PURPOSE;
              application.subpurpose = application.features[0].properties.TENURE_SUBPURPOSE;
              application.type = application.features[0].properties.TENURE_TYPE;
              application.subtype = application.features[0].properties.TENURE_SUBTYPE;
              application.status = application.features[0].properties.TENURE_STATUS;
              console.log('TENURE_STATUS =', application.features[0].properties.TENURE_STATUS);
              application.tenureStage = application.features[0].properties.TENURE_STAGE;
              application.cl_file = +application.features[0].properties.CROWN_LANDS_FILE; // NOTE: unary operator
              application.location = application.features[0].properties.TENURE_LOCATION;
              application.businessUnit = application.features[0].properties.RESPONSIBLE_BUSINESS_UNIT;
              application.tantalisID = application.features[0].properties.DISPOSITION_TRANSACTION_SID;
              application.interestID = application.features[0].properties.INTRID_SID;
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

  publish(app: Application): Subscription {
    return this.api.publishApplication(app)
      .subscribe(
        () => app.isPublished = true,
        error => console.log('publish error =', error)
      );
  }

  unPublish(app: Application): Subscription {
    return this.api.unPublishApplication(app)
      .subscribe(
        () => app.isPublished = false,
        error => console.log('unpublish error =', error)
      );
  }

  delete(app: Application): Observable<any> {
    return this.api.deleteApplication(app)
      .map(res => { return res; })
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

    return this.api.saveApplication(app)
      .map(res => {
        const a = res.text() ? res.json() : null;
        return a ? new Application(a) : null;
      })
      .catch(this.api.handleError);
  }

  // returns application status based on status code
  getStatus(application: Application): string {
    if (!application || !application.status) {
      return null; // 'Unknown Application Status';
    }

    switch (application.status.toUpperCase()) {
      case 'ABANDONED': return 'Application Abandoned';
      case 'ACCEPTED': return 'Application Under Review';
      case 'ALLOWED': return 'Decision: Allowed';
      case 'DISALLOWED': return 'Decision: Not Approved';
      case 'DISPOSITION IN GOOD STANDING': return 'Tenure: Disposition in Good Standing';
      case 'OFFER ACCEPTED': return 'Decision: Offer Accepted';
      case 'OFFER NOT ACCEPTED': return 'Decision: Offer Not Accepted';
      case 'OFFERED': return 'Decision: Offered';
      case 'SUSPENDED': return 'Tenure: Suspended';
    }

    // else return current status in title case
    return _.startCase(_.camelCase(application.status));
  }
}
