import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApplicationService } from 'app/services/application.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    // although we aren't currently using numApplications,
    // this verifies our login token and redirects in case of error
    this.applicationService
      .getCount()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {},
        () => {
          console.log('error = could not count applications');
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
