import { Component, OnInit } from '@angular/core';
import { Home } from '../models/home';
import { ApplicationService } from '../services/application.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  results: Array<Home>;
  numApplications: number;
  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private authenticationService: AuthenticationService,
    private api: ApiService
  ) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.applicationService.getCount().subscribe(
      value => { this.numApplications = value; },
      error => {
        this.router.navigate(['/login']);
        console.log('ERROR =', 'could not count applications');
      }
    );
  }
}
