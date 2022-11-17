import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProjectService } from 'app/services/project.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private numProjects: number = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private projectService: ProjectService
  ) { }

  /**
   * Get the total number of projects from the API.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    // although we aren't currently using numProjects,
    // this verifies our login token and redirects in case of error
    this.projectService.getCount()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        value => {
          this.numProjects = value;
        },
        () => {
          console.error('could not count projects');
        }
      );
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
