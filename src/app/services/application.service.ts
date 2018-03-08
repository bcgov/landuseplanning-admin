import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
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
      .map((applications: Application[]) => {
        return applications.length;
      });
  }

  // get all applications
  getAll(): Observable<Application[]> {
    // first get the applications
    return this.getAllInternal()
      .mergeMap((applications: Application[]) => {
        if (applications.length === 0) {
          return [];
        }

        const promises: Array<Promise<any>> = [];

        // now get the organization for each application
        applications.forEach((application, i) => {
          if (applications[i]._organization) {
            promises.push(this.organizationService.getById(applications[i]._organization)
              .toPromise()
              .then(organization => application.organization = organization));
          }
        });

        // now get the current comment period for each application
        applications.forEach((application, i) => {
          promises.push(this.commentPeriodService.getAllByApplicationId(applications[i]._id)
            .toPromise()
            .then(periods => applications[i].currentPeriod = this.commentPeriodService.getCurrent(periods)));
        });

        return Promise.all(promises).then(() => { return applications; });
      });
  }

  // get just the applications
  private getAllInternal(): Observable<Application[]> {
    return this.api.getApplications()
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        applications.forEach((application, i) => {
          applications[i] = new Application(application);
        });
        return applications;
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
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? new Application(applications[0]) : null;
      })
      .mergeMap((application: Application) => {
        if (!application) { return null; }

        const promises: Array<Promise<any>> = [];

        // now get the organization
        if (application._organization) {
          promises.push(this.organizationService.getById(application._organization, forceReload)
            .toPromise()
            .then(organization => application.organization = organization)
          );
        }

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

        // now get the shapes
        promises.push(this.searchService.getByDTID(application.tantalisID.toString())
          .toPromise()
          .then(features => {
            application.features = features;
            // calculate areaHectares
            let areaHectares = 0;
            _.each(application.features, function (f) {
              if (f['properties']) {
                areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
              }
            });
            application.areaHectares = areaHectares;
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
        value => app.isPublished = true,
        error => console.log('publish error =', error)
      );
  }

  unPublish(app: Application): Subscription {
    return this.api.unPublishApplication(app)
      .subscribe(
        value => app.isPublished = false,
        error => console.log('unpublish error =', error)
      );
  }

  delete(app: Application): Observable<any> {
    return this.api.deleteApplication(app)
      .map(res => { return res; })
      .catch(this.api.handleError);
  }

  addApplication(item: any): Observable<Application> {
    const app = new Application();
    if (item && item.properties) {
      app.purpose = item.properties.TENURE_PURPOSE;
      app.subpurpose = item.properties.TENURE_SUBPURPOSE;
      // app.cl_files = ;
      app.type = item.properties.TENURE_TYPE;
      app.subtype = item.properties.TENURE_SUBTYPE;
      app.status = item.properties.TENURE_STATUS;
      app.cl_files = item.properties.CROWN_LANDS_FILE;
      // app.region = item.region;
      app.location = item.properties.TENURE_LOCATION;
      // app.latitude = item.latitude
      // app.longitude = item.longitude;
      app.businessUnit = item.properties.RESPONSIBLE_BUSINESS_UNIT;
      // app.areaHectares = 4993;
      // app.legalDescription = 'ALL THAT UNSURVEYED CROWN LAND IN THE VICINITY OF BAKER POINT SITUATED ON NORTH'
      //   + ' ARISTAZABAL ISLAND, RANGE 3 COAST DISTRICT, CONTAINING 4,993 HECTARES, MORE OR LESS.';
      app.agency = 'Crown Land Allocation';
      // app.mapsheet = "103A.055 103A.064 103A.065 103A.074 103A.075 103A.084";
      // app.description = 'SB Central Coast Holdings is submitting an application for an amendment to an investigative'
      //   + 'licence for activities related to the development of a utility scale wind power generation facility. The purpose'
      //   + 'of the Aristabazal Island Wind Farm Project will be to supply electricity into the BC grid. The purpose of the'
      //   + 'investigative phase will be to establish project feasibility and to investigate factors that require'
      //   + 'consideration in the design and permitting of the project. SB Central Coast Holdings holds two investigative'
      //   + 'licences on Aristazabal Island.';
      app.tantalisID = item.properties.DISPOSITION_TRANSACTION_SID;
      // app.internalID = 120409;
      app.interestID = item.properties.INTRID_SID;
      // app.postID = 54104;
    } else {
      // Boilerplate
      app.purpose = 'TENURE_PURPOSE';
      app.subpurpose = 'TENURE_SUBPURPOSE';
      app.type = 'TENURE_TYPE';
      app.subtype = 'TENURE_SUBTYPE';
      app.status = 'TENURE_STATUS';
      app.region = 'Skeena';
      app.location = 'TENURE_LOCATION';
      app.businessUnit = 'RESPONSIBLE_BUSINESS_UNIT';
      app.areaHectares = 0;
      app.legalDescription = 'ALL THAT UNSURVEYED CROWN LAND...';
      app.agency = 'Crown Land Allocation';
      app.description = 'Description...';
      app.name = 'New Application';
      app.interestID = 0;
    }
    delete app._id;
    return this.api.addApplication(app)
      .map((res: Response) => {
        const application = res.text() ? res.json() : [];
        // console.log("application:", application);
        return new Application(application);
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

    // return status in title case
    return _.startCase(_.camelCase(application.status));
  }
}
