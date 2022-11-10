import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-not-authorized',
  templateUrl: './not-authorized.component.html',
  styleUrls: ['./not-authorized.component.scss']
})
export class NotAuthorizedComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loggedout = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(paramMap => {
      this.loggedout = paramMap.get('loggedout') === 'true';
    });
  }

  login() {
    window.location.href = window.location.origin + '/admin/search';
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
