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

  getById(id: string): Observable<Application> {
    // return this.application = null;

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

  get(): Application {
    return this.application;
  }
}
