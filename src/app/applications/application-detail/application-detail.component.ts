import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { ApiService } from '../../services/api';
import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {
  public application: Application;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public applicationService: ApplicationService // used in template
  ) { }

  ngOnInit(): void {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return; // return false;
    }

    // get data directly from resolver
    this.application = this.route.snapshot.data.application;

    // application not found --> navigate back to application list
    if (!this.application || !this.application._id) {
      alert('Uh-oh, application not found');
      this.router.navigate(['/applications']);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public gotoMap(): void {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it.
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }
}
