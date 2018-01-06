import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../models/application';
// import { CollectionsArray } from '.  ./../models/collection';
// import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {
  // public properties
  loading: boolean;
  application: Application;
  // collections: CollectionsArray;

  // private fields
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router
    // ,private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.loading = true;

    // this.collections = [new Collection(this.documentService.getDocuments())];

    // wait for the resolver to retrieve the application details from back-end
    this.sub = this.route.data.subscribe(
      (data: { application: Application }) => {
        this.loading = false;
        this.application = data.application;

        // application not found --> navigate back to application list
        if (!this.application || !this.application._id) {
          console.log('Application not found!');
          this.gotoApplicationList();
        }

        // this.collections = data.application.collections.documents;
        // this.collections.sort();
      },
      error => console.log(error)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  gotoApplicationList(): void {
    this.router.navigate(['/applications']);
  }

  gotoMap(): void {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it.
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }
}
