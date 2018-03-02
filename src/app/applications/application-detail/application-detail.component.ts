import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { ApiService } from '../../services/api';
import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { CommentPeriodService } from '../../services/commentperiod.service';
// import { CollectionsArray } from '../../models/collection';
// import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  // public collections: CollectionsArray;

  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService
    // private documentService: DocumentService,
  ) { }

  ngOnInit(): void {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return; // return false;
    }

    this.loading = true;

    // this.collections = [new Collection(this.documentService.getAllByApplicationId())];

    // wait for the resolver to retrieve the application details from back-end
    this.sub = this.route.data
      // .finally(() => this.loading = false) // TODO: make this work
      .subscribe(
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
        error => {
          this.loading = false;
          // If 403, redir to /login.
          if (error.startsWith('403')) {
            this.router.navigate(['/login']);
          }
          alert('Error loading application');
        });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private gotoApplicationList(): void {
    this.router.navigate(['/applications']);
  }

  public gotoMap(): void {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it.
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }

}
