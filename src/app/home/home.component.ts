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
  numApplications: Number;
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

    this.applicationService.getAll().subscribe(
      data => { this.numApplications = data ? data.length : 0; },
      error => {
        // If 403, redir to /login.
        this.router.navigate(['/login']);
        console.log(error);
      }
    );
  }
}
