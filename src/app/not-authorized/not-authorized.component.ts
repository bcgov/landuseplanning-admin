import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'app-not-authorized',
  templateUrl: './not-authorized.component.html',
  styleUrls: ['./not-authorized.component.scss']
})
export class NotAuthorizedComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loggedout = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.route.queryParamMap
    .takeUntil(this.ngUnsubscribe)
    .subscribe(paramMap => {
      this.loggedout = paramMap.get('loggedout') === 'true';
    });
  }

  login() {
    // Either go to the local login, or attempt IDIR auth
    this.api.ensureLoggedIn();
    this.router.navigate(['search']);
  }
}
