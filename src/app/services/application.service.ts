import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Application } from 'app/models/application';
// import { CollectionsList } from 'app/models/collection';

@Injectable()
export class ApplicationService {
  public application: Application;

  constructor(private api: ApiService) { }

  getAll(): Observable<Application[]> {
    return this.api.getApplications()
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];

        applications.forEach((application, index) => {
          applications[index] = new Application(application);
        });

        return applications;
      })
      .catch(this.api.handleError);
  }

  addApplication(item: any): Observable<Application> {
    const app = new Application();
    app.purpose = item.properties.PURPOSE;
    app.subpurpose = item.properties.SUBPURPOSE;
    // app.cl_files = ;
    app.type = item.properties.TENURE_TYPE;
    app.subtype = item.properties.TENURE_SUBTYPE;
    app.status = item.properties.TENURE_STATUS;
    // app.region = item.region;
    app.location = item.properties.TENURE_LOCATION;
    // app.latitude = item.latitude
    // app.longitude = item.longitude;
    app.businessUnit = item.properties.RESPONSIBLE_BUSINESS_UNIT;
    // app.areaHectares = 4993;
    // app.legalDescription = "ALL THAT UNSURVEYED CROWN LAND IN THE VICINITY OF BAKER POINT SITUATED ON NORTH ARISTAZABAL ISLAND, RANGE 3 COAST DISTRICT, CONTAINING 4,993 HECTARES, MORE OR LESS.";
    // app.agency = "Crown Land Allocation";
    // app.mapsheet = "103A.055 103A.064 103A.065 103A.074 103A.075 103A.084";
    // app.description = "SB Central Coast Holdings is submitting an application for an amendment to an investigative licence for activities related to the development of a utility scale wind power generation facility. The purpose of the Aristabazal Island Wind Farm Project will be to supply electricity into the BC grid. The purpose of the investigative phase will be to establish project feasibility and to investigate factors that require consideration in the design and permitting of the project. SB Central Coast Holdings holds two investigative licences on Aristazabal Island.";
    // app.tantalisID = 926032;
    app.stageCode = item.properties.CODE_CHR_STAGE;
    // app.internalID = 120409;
    app.interestID = item.properties.INTRID_SID;
    // app.postID = 54104;
    delete app._id;
    return this.api.addApplication(app)
    .map((res: Response) => {
      const application = res.text() ? res.json() : [];
      // console.log("application:", application);
      return new Application(application);
    })
    .catch(this.api.handleError);
  }

  getById(id: string): Observable<Application> {
    // first grab the application data
    return this.api.getApplication(id)
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? applications[0] : null;
      })
      .map((application: Application) => {
        // if (!application) { return; }

        // cache application
        this.application = application;

        // this.application.collections = new CollectionsList();

        // // Now grab the MEM collections
        // this.api.getProjectCollectionsMEM(this.project.code)
        //   .map((res: Response) => this.processCollections(res))
        //   .subscribe(memCollections => {
        //     // Push them into the project
        //     memCollections.forEach(collection => {
        //       this.addCollection(this.project.collections, collection);
        //     });
        //   });

        // // Get EPIC collections next.
        // // Note: there may be multiple (or no) EPIC projects associated with this MEM project.
        // this.project.epicProjectCodes.forEach(epicProjectCode => {
        //   this.api.getProjectCollectionsEPIC(epicProjectCode)
        //     .map((res: Response) => this.processCollections(res))
        //     .subscribe(epicCollections => {
        //       // Push them into the project
        //       epicCollections.forEach(collection => {
        //         this.addCollection(this.project.collections, collection);
        //       });
        //     });
        // });

        return this.application;
      })
      .catch(this.api.handleError);
  }
}
